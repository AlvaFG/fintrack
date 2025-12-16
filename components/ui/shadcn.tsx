import React, { InputHTMLAttributes, ButtonHTMLAttributes, useState, ReactNode, createContext, useContext } from 'react';
import { ChevronDown, X, Check, Loader2 } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', className = '', isLoading, disabled, ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600",
    secondary: "bg-secondary text-white hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost: "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-danger text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// --- INPUT ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <input
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:ring-offset-gray-950 ${error ? 'border-red-500 dark:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

// --- CARD ---
export const Card: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 shadow-sm ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

export const CardContent: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// --- BADGE ---
export const Badge: React.FC<{ children: ReactNode, className?: string, variant?: 'default' | 'outline' | 'secondary' | 'danger', style?: React.CSSProperties }> = ({ children, className = '', variant = 'default', style }) => {
  const variants = {
    default: "border-transparent bg-primary text-white hover:bg-primary/80",
    secondary: "border-transparent bg-secondary/20 text-secondary hover:bg-secondary/30 dark:bg-secondary/30 dark:text-emerald-400",
    outline: "text-gray-950 border-gray-200 dark:text-gray-300 dark:border-gray-700",
    danger: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  };
  return (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`} style={style}>
      {children}
    </div>
  );
};

// --- DIALOG / MODAL ---
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 transition-all duration-200" onClick={() => onOpenChange(false)}>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl rounded-xl sm:max-w-[500px] animate-in fade-in zoom-in-95 duration-200 mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 ${className}`}>{children}</div>
);

export const DialogHeader: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 px-6 pt-6 pb-4 ${className}`}>
    {children}
  </div>
);

export const DialogTitle: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight dark:text-gray-50 ${className}`}>{children}</h2>
);

export const DialogDescription: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>
);

export const DialogFooter: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 pb-6 pt-4 ${className}`}>
    {children}
  </div>
);

// --- LABEL ---
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </label>
);

// --- SELECT (Simple Native Wrapper for reliability) ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, options, className, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <div className="relative">
                <select
                    ref={ref}
                    className={`flex h-10 w-full appearance-none items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 ${className}`}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>
    );
});
Select.displayName = 'Select';

// --- TABS ---
// Context for Tabs to share state
interface TabsContextType {
  value: string;
  onValueChange: (val: string) => void;
}
const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    value: string;
    onValueChange: (val: string) => void;
    children: ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 w-full ${className}`}>
        {children}
    </div>
);

export const TabsTrigger: React.FC<{ value: string; children: ReactNode }> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  
  const isSelected = context.value === value;
  
  return (
    <button
        onClick={() => context.onValueChange(value)}
        type="button"
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full ${isSelected ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 shadow-sm' : 'hover:text-gray-700 dark:hover:text-gray-300'}`}
    >
        {children}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string; children: ReactNode; className?: string }> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");
    
    if (context.value !== value) return null;
    return <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 animate-in fade-in-50 duration-200 ${className}`}>{children}</div>;
};

// --- AVATAR ---
export const Avatar: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);

export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className, ...props }) => (
  <img className={`aspect-square h-full w-full object-cover ${className || ''}`} {...props} />
);

export const AvatarFallback: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${className}`}>{children}</div>
);

// --- SKELETON ---
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`} />
);

// --- SEPARATOR ---
export const Separator: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`h-[1px] w-full bg-gray-200 dark:bg-gray-700 my-4 ${className}`} />
);