"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  id: string;
  title: string;
  description: string;
  acceptedFileTypes: string; // Comma-separated string for input accept attribute
  icon: React.ReactNode;
  onFileChange: (file: File | null) => void;
  maxFileSizeMB?: number;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  id,
  title,
  description,
  acceptedFileTypes,
  icon,
  onFileChange,
  maxFileSizeMB = 10,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileValidation = (file: File): boolean => {
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Please upload a file smaller than ${maxFileSizeMB}MB.`,
      });
      return false;
    }
    
    const allowedMimeTypes = acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const fileMimeType = file.type.toLowerCase();

    const isValidMimeType = allowedMimeTypes.some(allowedType => {
      if (allowedType.startsWith('.')) { // It's an extension
        return fileExtension === allowedType;
      }
      if (allowedType.endsWith('/*')) { // It's a wildcard MIME type
        return fileMimeType.startsWith(allowedType.slice(0, -2));
      }
      return fileMimeType === allowedType; // Exact MIME type match
    });

    if (!isValidMimeType) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Please upload a file of type: ${acceptedFileTypes.replace(/,/g, ', ')}. You uploaded: ${fileMimeType || fileExtension}`,
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (file && handleFileValidation(file)) {
      setSelectedFile(file);
      onFileChange(file);
    } else {
      setSelectedFile(null);
      onFileChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileSelect(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [onFileChange, maxFileSizeMB, acceptedFileTypes]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files[0]);
    } else {
      handleFileSelect(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start space-x-4 pb-4">
        <div className="text-primary p-2 bg-primary/10 rounded-lg mt-1">{icon}</div>
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {selectedFile ? (
          <div className="space-y-3 p-4 border border-dashed rounded-lg bg-muted/30">
            <div className="flex items-center space-x-3">
              <FileIcon className="h-10 w-10 text-primary" />
              <div className="flex-grow overflow-hidden">
                <p className="font-medium text-sm truncate" title={selectedFile.name}>{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Clear selected file">
                <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-labelledby={`${id}-label`}
            className={cn(
              "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 ease-in-out",
              isDragOver ? "border-primary bg-accent/10" : "border-border hover:bg-accent/5"
            )}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();}}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
            <p id={`${id}-label`} className="text-sm font-medium text-center text-foreground">
              Drag & drop your file here, or click to select.
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Accepted: {acceptedFileTypes.replace(/,/g, ', ').replace(/application\//g, '')}. Max {maxFileSizeMB}MB.
            </p>
            <Input
              ref={fileInputRef}
              id={id}
              type="file"
              className="hidden"
              accept={acceptedFileTypes}
              onChange={onFileInputChange}
              aria-hidden="true"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadZone;
