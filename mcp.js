#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados en .env.local');
  process.exit(1);
}

// Inicializar cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Crear servidor MCP
const server = new Server(
  {
    name: 'fintrack-pro-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// HERRAMIENTAS (TOOLS)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_expenses',
        description: 'Obtiene todos los gastos almacenados en Supabase',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Número máximo de gastos a retornar (default: 100)',
            },
            category: {
              type: 'string',
              description: 'Filtrar por categoría (opcional)',
            },
          },
        },
      },
      {
        name: 'add_expense',
        description: 'Agrega un nuevo gasto a la base de datos',
        inputSchema: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Monto del gasto',
            },
            currency: {
              type: 'string',
              description: 'Moneda (ARS o USD)',
              enum: ['ARS', 'USD'],
            },
            categoryId: {
              type: 'string',
              description: 'ID de la categoría',
            },
            description: {
              type: 'string',
              description: 'Descripción del gasto',
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales (opcional)',
            },
          },
          required: ['amount', 'currency', 'categoryId', 'description'],
        },
      },
      {
        name: 'get_categories',
        description: 'Obtiene todas las categorías de gastos',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_monthly_summary',
        description: 'Obtiene un resumen de gastos por mes',
        inputSchema: {
          type: 'object',
          properties: {
            year: {
              type: 'number',
              description: 'Año para el resumen (default: año actual)',
            },
            month: {
              type: 'number',
              description: 'Mes para el resumen (1-12, opcional)',
            },
          },
        },
      },
      {
        name: 'delete_expense',
        description: 'Elimina un gasto por su ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID del gasto a eliminar',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_expenses': {
        const limit = args.limit || 100;
        let query = supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false })
          .limit(limit);

        if (args.category) {
          query = query.eq('categoryId', args.category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'add_expense': {
        const newExpense = {
          amount: args.amount,
          currency: args.currency,
          categoryId: args.categoryId,
          description: args.description,
          notes: args.notes || null,
          date: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('expenses')
          .insert([newExpense])
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Gasto agregado exitosamente: ${JSON.stringify(data[0], null, 2)}`,
            },
          ],
        };
      }

      case 'get_categories': {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_monthly_summary': {
        const year = args.year || new Date().getFullYear();
        const startDate = args.month
          ? new Date(year, args.month - 1, 1)
          : new Date(year, 0, 1);
        const endDate = args.month
          ? new Date(year, args.month, 0)
          : new Date(year, 11, 31);

        const { data, error } = await supabase
          .from('expenses')
          .select('amount, currency, date, categoryId')
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString());

        if (error) throw error;

        const summary = {
          totalARS: data
            .filter((e) => e.currency === 'ARS')
            .reduce((sum, e) => sum + e.amount, 0),
          totalUSD: data
            .filter((e) => e.currency === 'USD')
            .reduce((sum, e) => sum + e.amount, 0),
          count: data.length,
          period: args.month
            ? `${year}-${String(args.month).padStart(2, '0')}`
            : String(year),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      case 'delete_expense': {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', args.id);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Gasto con ID ${args.id} eliminado exitosamente`,
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// RECURSOS (RESOURCES)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'fintrack://expenses/recent',
        name: 'Gastos Recientes',
        description: 'Últimos 20 gastos registrados',
        mimeType: 'application/json',
      },
      {
        uri: 'fintrack://categories/all',
        name: 'Todas las Categorías',
        description: 'Lista completa de categorías de gastos',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri === 'fintrack://expenses/recent') {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (uri === 'fintrack://categories/all') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Recurso no encontrado: ${uri}`);
  } catch (error) {
    throw new Error(`Error al leer recurso: ${error.message}`);
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FinTrack Pro MCP Server iniciado');
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
