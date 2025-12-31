import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ExportButtonProps {
  type: 'carbon' | 'device' | 'comprehensive';
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({ type, label = '導出報告', variant = 'outline', size = 'default' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const carbonReportMutation = trpc.export.carbonReport.useMutation();
  const deviceEnergyMutation = trpc.export.deviceEnergy.useMutation();
  const comprehensiveMutation = trpc.export.comprehensive.useMutation();

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true);
    
    try {
      let result;
      
      if (type === 'carbon') {
        result = await carbonReportMutation.mutateAsync({ format });
      } else if (type === 'device') {
        result = await deviceEnergyMutation.mutateAsync({ format });
      } else {
        result = await comprehensiveMutation.mutateAsync({});
      }
      
      // 將base64數據轉換為Blob並下載
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: result.mimeType });
      
      // 創建下載鏈接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`報告已成功導出：${result.filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('導出失敗，請稍後再試');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              導出中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>選擇格式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {type !== 'comprehensive' && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="mr-2 h-4 w-4" />
            CSV 格式
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel 格式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
