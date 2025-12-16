#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de base de datos...\n');

  // Insertar categorías iniciales
  console.log('📁 Insertando categorías...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .insert([
      { name: 'Comida', color: '#FF6B6B', icon: '🍔', is_preset: true },
      { name: 'Transporte', color: '#4ECDC4', icon: '🚌', is_preset: true },
      { name: 'Salidas', color: '#FFD93D', icon: '🎉', is_preset: true },
      { name: 'Gastos Fijos', color: '#95E1D3', icon: '🏠', is_preset: true },
      { name: 'Salud', color: '#A8E6CF', icon: '⚕️', is_preset: true },
      { name: 'Suscripciones', color: '#A8D8EA', icon: '📺', is_preset: true },
    ])
    .select();

  if (catError) {
    console.error('❌ Error al crear categorías:', catError.message);
    return;
  }

  console.log(`✅ ${categories.length} categorías creadas`);

  // Insertar gastos de ejemplo
  console.log('\n💰 Insertando gastos de ejemplo...');
  const { data: expenses, error: expError } = await supabase
    .from('expenses')
    .insert([
      {
        amount: 12500,
        currency: 'ARS',
        category_id: categories[0].id, // Comida
        description: 'Compra Supermercado',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        amount: 15.99,
        currency: 'USD',
        category_id: categories[5].id, // Suscripciones
        description: 'Netflix',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        amount: 4500,
        currency: 'ARS',
        category_id: categories[1].id, // Transporte
        description: 'Uber a casa',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        amount: 32000,
        currency: 'ARS',
        category_id: categories[2].id, // Salidas
        description: 'Cena con amigos',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        amount: 120,
        currency: 'USD',
        category_id: categories[3].id, // Gastos Fijos
        description: 'Hosting Web',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])
    .select();

  if (expError) {
    console.error('❌ Error al crear gastos:', expError.message);
    return;
  }

  console.log(`✅ ${expenses.length} gastos de ejemplo creados`);

  console.log('\n🎉 ¡Base de datos configurada exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - ${categories.length} categorías`);
  console.log(`   - ${expenses.length} gastos de ejemplo`);
  console.log('\n✨ Ya puedes usar la aplicación!');
}

setupDatabase().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
