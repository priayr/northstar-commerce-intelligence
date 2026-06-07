"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Upload, FileType, CheckCircle2, XCircle, AlertCircle, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXPECTED_COLUMNS = ["id", "customer_id", "order_date", "total", "status"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

type ParsedData = Record<string, any>[];

type SchemaValidation = {
  column: string;
  expected: boolean;
  type: "number" | "string" | "date" | "unknown";
  missingPct: number;
};

export function CsvUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Parsing states
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  
  // Validation states
  const [schema, setSchema] = useState<SchemaValidation[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null);
  const [outliersCount, setOutliersCount] = useState(0);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndParseFile(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndParseFile(e.target.files[0]);
    }
  };

  const validateAndParseFile = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      setError("Please upload a valid .csv file.");
      return;
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds the 20MB limit.");
      return;
    }
    
    setFile(selectedFile);
    setIsParsing(true);
    setIsSuccess(false);
    
    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        analyzeData(results.data as ParsedData, results.meta.fields || []);
        setParsedData(results.data as ParsedData);
        setIsParsing(false);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setIsParsing(false);
      }
    });
  };

  const analyzeData = (data: ParsedData, fields: string[]) => {
    setRecordCount(data.length);
    
    // 1. Schema Validation
    const validation: SchemaValidation[] = fields.map(field => {
      let type: "number" | "string" | "date" | "unknown" = "unknown";
      let missingCount = 0;
      
      // Sample first 100 valid rows to guess type
      for (let i = 0; i < Math.min(data.length, 100); i++) {
        const val = data[i][field];
        if (val === null || val === undefined || val === '') {
          missingCount++;
          continue;
        }
        if (type === "unknown") {
          if (typeof val === "number") type = "number";
          // Basic date guess (YYYY-MM-DD or ISO)
          else if (typeof val === "string" && !isNaN(Date.parse(val)) && val.includes("-")) type = "date";
          else type = "string";
        }
      }
      
      // Count total missing
      const totalMissing = data.filter(row => row[field] === null || row[field] === undefined || row[field] === '').length;
      
      return {
        column: field,
        expected: EXPECTED_COLUMNS.includes(field),
        type,
        missingPct: data.length > 0 ? (totalMissing / data.length) * 100 : 0
      };
    });
    setSchema(validation);
    
    // 2. Duplicates (naive check by id if exists, else stringify)
    if (fields.includes("id")) {
      const ids = new Set();
      let dups = 0;
      data.forEach(row => {
        if (ids.has(row.id)) dups++;
        else ids.add(row.id);
      });
      setDuplicateCount(dups);
    } else {
      setDuplicateCount(0); // too slow to stringify all on large files
    }
    
    // 3. Date Range
    if (fields.includes("order_date")) {
      const dates = data.map(d => new Date(d.order_date)).filter(d => !isNaN(d.getTime()));
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        setDateRange({
          start: minDate.toISOString().split('T')[0],
          end: maxDate.toISOString().split('T')[0]
        });
      }
    }
    
    // 4. Outliers (>3 std dev for 'total' column)
    if (fields.includes("total")) {
      const totals = data.map(d => Number(d.total)).filter(n => !isNaN(n));
      if (totals.length > 0) {
        const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
        const stdDev = Math.sqrt(totals.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / totals.length);
        const outliers = totals.filter(n => Math.abs(n - mean) > 3 * stdDev).length;
        setOutliersCount(outliers);
      }
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsUploading(true);
    setError(null);
    
    try {
      // Chunk the upload if large, but for demo assume it fits in a reasonable payload
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData }),
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      setIsSuccess(true);
      setParsedData(null); // Clear memory
    } catch (err: any) {
      setError(err.message || "Failed to import data.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData(null);
    setIsSuccess(false);
    setError(null);
  };

  if (isSuccess) {
    return (
      <div className="border border-[var(--color-border-strong)] rounded-lg p-8 flex flex-col items-center justify-center text-center bg-[var(--color-surface-1)]">
        <div className="w-16 h-16 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Import Successful</h3>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
          Successfully imported {formatNumber(recordCount)} records. Background aggregates have been updated.
        </p>
        <Button onClick={resetForm}>Import Another File</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Zone */}
      {!parsedData && !isParsing && (
        <div 
          className={`
            border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200
            ${isDragging 
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" 
              : "border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('csv-upload')?.click()}
        >
          <input 
            id="csv-upload" 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileInput} 
          />
          <div className={`p-4 rounded-full mb-4 ${isDragging ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"}`}>
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Drag & Drop CSV
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-xs">
            Upload your transactions or order data. Max file size: 20MB.
          </p>
          <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); document.getElementById('csv-upload')?.click(); }}>
            Select File
          </Button>
          {error && (
            <div className="mt-4 p-3 bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/20 text-[var(--color-negative)] rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Parsing State */}
      {isParsing && (
        <div className="border border-[var(--color-border-strong)] rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-[var(--color-accent)] animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Parsing CSV...</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Analyzing schema and data quality.</p>
        </div>
      )}

      {/* Review State */}
      {parsedData && !isParsing && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-md">
                <FileType className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">{file?.name}</h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {formatNumber(recordCount)} rows • {(file?.size ? file.size / 1024 / 1024 : 0).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetForm} disabled={isUploading}>
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schema Detection */}
            <div className="border border-[var(--color-border-strong)] rounded-lg overflow-hidden bg-[var(--color-surface-0)]">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">Schema Detection</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)] bg-[var(--color-surface-1)]/50">
                      <th className="p-3 font-medium">Column</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium text-center">Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.map(col => (
                      <tr key={col.column} className="border-b border-[var(--color-border)]/50 last:border-0">
                        <td className="p-3 font-medium text-[var(--color-text-primary)]">{col.column}</td>
                        <td className="p-3 text-[var(--color-text-secondary)] capitalize">{col.type}</td>
                        <td className="p-3 text-center">
                          {col.expected 
                            ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] inline" /> 
                            : <XCircle className="w-4 h-4 text-[var(--color-negative)] inline" />
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Quality Report */}
            <div className="border border-[var(--color-border-strong)] rounded-lg overflow-hidden bg-[var(--color-surface-0)] flex flex-col">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">Data Quality Report</h3>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="p-3 bg-[var(--color-surface-1)] rounded-md">
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">Date Range</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {dateRange ? `${dateRange.start} to ${dateRange.end}` : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-1)] rounded-md">
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">Duplicates & Outliers</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatNumber(duplicateCount)} dups • {formatNumber(outliersCount)} outl.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Missing Values</h4>
                  {schema.filter(c => c.expected).map(col => (
                    <div key={`miss-${col.column}`} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--color-text-primary)]">{col.column}</span>
                        <span className={col.missingPct > 5 ? "text-[var(--color-warning)]" : "text-[var(--color-text-secondary)]"}>
                          {col.missingPct.toFixed(1)}% missing
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${col.missingPct > 5 ? "bg-[var(--color-warning)]" : "bg-[var(--color-success)]"}`} 
                          style={{ width: `${Math.max(col.missingPct, 1)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/20 text-[var(--color-negative)] rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleImport} 
              disabled={isUploading || schema.filter(c => c.expected && !c.expected).length > 0}
              className="w-full sm:w-auto"
            >
              {isUploading ? "Importing Data..." : `Import ${formatNumber(recordCount)} Records`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility formatting within component file for simplicity
function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num);
}
