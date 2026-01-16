"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { cn } from "@packages/ui/index";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getUsageStatsAction } from "@/adapters/actions/llm-usage.actions";
import type {
  IGetUsageStatsOutputDto,
  IUsageBreakdownDto,
} from "@/application/dto/llm/get-usage-stats.dto";

type GroupBy = "day" | "week" | "month" | "provider" | "model";

export function UsageDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<IGetUsageStatsOutputDto | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const getDateRange = useCallback(() => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    if (dateRange === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 90);
    }
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate,
    };
  }, [dateRange]);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    const dates = getDateRange();
    const result = await getUsageStatsAction({
      ...dates,
      groupBy,
    });

    if (result.success) {
      setStats(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [groupBy, getDateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const budgetPercentage = (used: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const groupByOptions: { value: GroupBy; label: string }[] = [
    { value: "day", label: "By Day" },
    { value: "week", label: "By Week" },
    { value: "month", label: "By Month" },
    { value: "provider", label: "By Provider" },
    { value: "model", label: "By Model" },
  ];

  const dateRangeOptions: { value: "7d" | "30d" | "90d"; label: string }[] = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex border-3 border-black dark:border-white">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDateRange(option.value)}
              className={cn(
                "px-4 py-2 font-bold uppercase text-xs tracking-wide transition-colors",
                dateRange === option.value
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white text-black dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900",
                option.value !== "7d" &&
                  "border-l-3 border-black dark:border-white",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="border-3 border-black dark:border-white bg-white dark:bg-black px-3 py-2 text-sm font-bold uppercase tracking-wide focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
        >
          {groupByOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          onClick={loadStats}
          variant="outline"
          size="sm"
          className="border-3 border-black dark:border-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : !stats ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase">
            Failed to load usage data
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Cost"
              value={formatCurrency(stats.totalCost)}
              trend={null}
            />
            <StatCard
              icon={Zap}
              label="Total Tokens"
              value={formatNumber(stats.totalTokens)}
              trend={null}
            />
            <StatCard
              icon={Activity}
              label="Total Requests"
              value={formatNumber(stats.requestCount)}
              trend={null}
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Cost/Request"
              value={
                stats.requestCount > 0
                  ? formatCurrency(stats.totalCost / stats.requestCount)
                  : "$0.0000"
              }
              trend={null}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border-3 border-black dark:border-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-black uppercase tracking-tight">
                  Budget Status
                </h3>
              </div>
              <div className="space-y-4">
                <BudgetBar
                  label="Daily Budget"
                  used={stats.budgetStatus.dailyUsed}
                  limit={stats.budgetStatus.dailyLimit}
                  formatValue={formatCurrency}
                  getBudgetColor={getBudgetColor}
                  budgetPercentage={budgetPercentage}
                />
                <BudgetBar
                  label="Monthly Budget"
                  used={stats.budgetStatus.monthlyUsed}
                  limit={stats.budgetStatus.monthlyLimit}
                  formatValue={formatCurrency}
                  getBudgetColor={getBudgetColor}
                  budgetPercentage={budgetPercentage}
                />
              </div>
              {budgetPercentage(
                stats.budgetStatus.dailyUsed,
                stats.budgetStatus.dailyLimit,
              ) >= 80 && (
                <div className="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-3 border-yellow-500 p-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase">
                    Approaching daily budget limit
                  </span>
                </div>
              )}
            </div>

            <div className="border-3 border-black dark:border-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5" />
                <h3 className="font-black uppercase tracking-tight">
                  Usage Breakdown
                </h3>
              </div>
              {stats.breakdown.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No usage data for this period
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {stats.breakdown.map((item, index) => (
                    <BreakdownItem
                      key={`breakdown-${item.period ?? item.provider ?? item.model ?? index}`}
                      item={item}
                      groupBy={groupBy}
                      formatCurrency={formatCurrency}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-3 border-black dark:border-white p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-black uppercase tracking-tight">
                  Cost Distribution
                </h3>
              </div>
            </div>
            {stats.breakdown.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No usage data to display
              </p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {stats.breakdown.slice(0, 30).map((item, index) => {
                  const maxCost = Math.max(
                    ...stats.breakdown.map((b) => b.cost),
                  );
                  const heightPercent =
                    maxCost > 0 ? (item.cost / maxCost) * 100 : 0;
                  return (
                    <div
                      key={`chart-${item.period ?? item.provider ?? item.model ?? index}`}
                      className="flex-1 bg-black dark:bg-white transition-all hover:bg-gray-700 dark:hover:bg-gray-300"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      title={`${item.period ?? item.provider ?? item.model ?? "Item"}: ${formatCurrency(item.cost)}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: { value: number; isPositive: boolean } | null;
}

function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="border-3 border-black dark:border-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black">{value}</span>
        {trend && (
          <Badge
            variant={trend.isPositive ? "default" : "destructive"}
            className="text-xs"
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </Badge>
        )}
      </div>
    </div>
  );
}

interface BudgetBarProps {
  label: string;
  used: number;
  limit: number;
  formatValue: (val: number) => string;
  getBudgetColor: (percentage: number) => string;
  budgetPercentage: (used: number, limit: number) => number;
}

function BudgetBar({
  label,
  used,
  limit,
  formatValue,
  getBudgetColor,
  budgetPercentage,
}: BudgetBarProps) {
  const percentage = budgetPercentage(used, limit);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-bold uppercase">{label}</span>
        <span className="text-gray-500">
          {formatValue(used)} / {formatValue(limit)}
        </span>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 border-2 border-black dark:border-white">
        <div
          className={cn("h-full transition-all", getBudgetColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}% used
      </div>
    </div>
  );
}

interface BreakdownItemProps {
  item: IUsageBreakdownDto;
  groupBy: GroupBy;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

function BreakdownItem({
  item,
  groupBy,
  formatCurrency,
  formatNumber,
}: BreakdownItemProps) {
  const getLabel = () => {
    if (groupBy === "provider" && item.provider) return item.provider;
    if (groupBy === "model" && item.model) return item.model;
    if (item.period) return item.period;
    return "Unknown";
  };

  return (
    <div className="flex items-center justify-between border-2 border-gray-200 dark:border-gray-700 p-3">
      <div>
        <span className="font-bold text-sm">{getLabel()}</span>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {formatNumber(item.tokens)} tokens
          </Badge>
          <Badge variant="outline" className="text-xs">
            {item.requests} requests
          </Badge>
        </div>
      </div>
      <span className="font-black text-lg">{formatCurrency(item.cost)}</span>
    </div>
  );
}
