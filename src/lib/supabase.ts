import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ipfxlxxsyvxxmounomee.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ayD-pZTRNTxrO3nVDZjeLw_eGjSNHRz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const SUPABASE_SETUP_SQL = `-- ========================================================
-- Script de Creación de Tablas para Macramé Aurora
-- Copiar y pegar todo este script en el SQL Editor de Supabase
-- ========================================================

-- 1. Tabla de Artículos del Catálogo
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  "threadType" TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL
);

-- 2. Tabla de Clientes y Alumnos
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL
);

-- 3. Tabla de Gastos en Insumos
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  concept TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  "paymentMethod" TEXT NOT NULL,
  notes TEXT
);

-- 4. Tabla de Ventas y Encargos
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  "articleId" TEXT,
  "productName" TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  "unitPrice" NUMERIC NOT NULL DEFAULT 0,
  "totalAmount" NUMERIC NOT NULL DEFAULT 0,
  "estimatedCost" NUMERIC DEFAULT 0,
  "paymentMethod" TEXT NOT NULL,
  "customerName" TEXT,
  "customerPhone" TEXT,
  notes TEXT,
  "isCustomOrder" BOOLEAN DEFAULT false,
  "depositAmount" NUMERIC DEFAULT 0,
  "isFullyPaid" BOOLEAN DEFAULT true,
  "deliveryDate" TEXT
);

-- 5. Tabla de Talleres y Reservas
CREATE TABLE IF NOT EXISTS public.workshops (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  "durationHours" NUMERIC,
  location TEXT NOT NULL,
  "maxCapacity" NUMERIC NOT NULL DEFAULT 1,
  "pricePerPerson" NUMERIC NOT NULL DEFAULT 0,
  "suggestedDeposit" NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Programado',
  reservations JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Configuración de Seguridad RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo en articles" ON public.articles;
DROP POLICY IF EXISTS "Permitir todo en clients" ON public.clients;
DROP POLICY IF EXISTS "Permitir todo en expenses" ON public.expenses;
DROP POLICY IF EXISTS "Permitir todo en sales" ON public.sales;
DROP POLICY IF EXISTS "Permitir todo en workshops" ON public.workshops;

CREATE POLICY "Permitir todo en articles" ON public.articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en workshops" ON public.workshops FOR ALL USING (true) WITH CHECK (true);

-- Configuración de Sincronización en Tiempo Real
ALTER TABLE public.articles REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.expenses REPLICA IDENTITY FULL;
ALTER TABLE public.sales REPLICA IDENTITY FULL;
ALTER TABLE public.workshops REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.articles, public.clients, public.expenses, public.sales, public.workshops;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
`;
