/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-black/5 shadow-sm p-6", className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-zinc-900 leading-tight tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
          <h4 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">{value}</h4>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            )}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-zinc-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600 border border-zinc-100">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
