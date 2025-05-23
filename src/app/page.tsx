"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app/app-header';
import FileUploadZone from '@/components/app/file-upload-zone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import { Loader2, Sparkles, FileText, FileType2, Languages, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export default function LinguaLeapPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [populatedDocumentDataUri, setPopulatedDocumentDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentProgressStep, setCurrentProgressStep] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setCurrentProgressStep("");
    }
  }, [isLoading]);

  const handleProcessDocuments = async () => {
    if (!pdfFile || !templateFile || !targetLanguage.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please upload both PDF and template files, and specify a target language.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setPopulatedDocumentDataUri(null);
    setProgress(5);

    try {
      setCurrentProgressStep("Extracting PDF content...");
      const pdfData = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const pdfText = textContent.items.map((item: any) => item.str).join(' ');
      setProgress(30);

      setCurrentProgressStep("Processing template...");
      const templateData = await templateFile.arrayBuffer();
      const { value: templateText } = await mammoth.extractRawText({ arrayBuffer: templateData });
      setProgress(50);

      setCurrentProgressStep("AI processing content...");
      toast({
        title: "Processing Document...",
        description: "LinguaLeap's AI is diligently working. This may take a moment.",
      });
      
      setProgress(70);
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfText,
          templateText,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process documents');
      }

      const result = await response.json();
      setProgress(90);

      if (result.translatedContent) {
        const blob = new Blob([result.translatedContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const dataUri = await fileToDataUri(new File([blob], 'translated.docx'));
        setPopulatedDocumentDataUri(dataUri);
        setProgress(100);
        
        toast({
          variant: "default",
          title: "Success! Document Ready",
          description: "Your document has been processed and is ready for download.",
          className: "bg-green-600 text-white border-green-700",
        });
      } else {
        throw new Error("AI processing did not return valid content.");
      }
    } catch (err) {
      console.error("Processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during processing. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: errorMessage,
      });
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getDownloadFileName = () => {
    if (templateFile) {
      const nameParts = templateFile.name.split('.');
      const extension = nameParts.pop();
      const nameWithoutExtension = nameParts.join('.');
      return `LinguaLeap_${nameWithoutExtension}_${targetLanguage.trim().toLowerCase() || 'translated'}.${extension || 'docx'}`;
    }
    return `LinguaLeap_Translated_Document.docx`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Unlock Effortless Document Translation
            </h2>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Upload your PDF, provide a Word template, specify the language, and let LinguaLeap's AI bridge the gap.
            </p>
          </div>

          <FileUploadZone
            id="pdf-upload"
            title="Step 1: Upload PDF Document"
            description="Select the PDF file containing the names and numbers you want to extract."
            acceptedFileTypes=".pdf,application/pdf"
            icon={<FileText className="w-7 h-7" />}
            onFileChange={setPdfFile}
            maxFileSizeMB={5}
          />

          <FileUploadZone
            id="template-upload"
            title="Step 2: Upload Word Template"
            description="Choose the Word document (.docx, .doc) that will serve as the template for translation."
            acceptedFileTypes=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            icon={<FileType2 className="w-7 h-7" />}
            onFileChange={setTemplateFile}
            maxFileSizeMB={2}
          />

          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
             <CardHeader className="flex flex-row items-start space-x-4 pb-4">
              <div className="text-primary p-2 bg-primary/10 rounded-lg mt-1"><Languages className="w-7 h-7" /></div>
              <div>
                <CardTitle className="text-xl font-semibold">Step 3: Specify Target Language</CardTitle>
                <CardDescription className="text-sm">Enter the language of your Word template (e.g., Spanish, French, German).</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Label htmlFor="targetLanguage" className="sr-only">Target Language</Label>
              <Input
                id="targetLanguage"
                type="text"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                placeholder="e.g., Spanish"
                className="text-base py-3 px-4"
                aria-label="Target language for the template"
                aria-required="true"
              />
            </CardContent>
          </Card>
          
          {isLoading && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-center text-lg font-medium">Processing Your Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground text-center">{currentProgressStep || "Initializing..."} ({progress}%)</p>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleProcessDocuments}
            disabled={isLoading || !pdfFile || !templateFile || !targetLanguage.trim()}
            className="w-full py-3.5 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            size="lg"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-6 w-6" />
            )}
            LinguaLeap It!
          </Button>

          {error && !isLoading && (
            <Alert variant="destructive" className="shadow-md animate-in fade-in duration-300">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Oops! Something went wrong.</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {populatedDocumentDataUri && !isLoading && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 shadow-xl animate-in fade-in zoom-in-95 duration-500">
              <CardHeader className="flex flex-row items-start space-x-4 pb-3">
                <div className="text-green-600 dark:text-green-400 p-2 bg-green-500/10 rounded-lg mt-1"><CheckCircle2 className="w-7 h-7" /></div>
                <div>
                  <CardTitle className="text-xl font-semibold text-green-700 dark:text-green-300">Step 4: Your Document is Ready!</CardTitle>
                  <CardDescription className="text-sm text-green-600 dark:text-green-400">The AI has successfully populated your template. Download it now.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-5 pt-2 pb-6">
                <Download className="w-16 h-16 text-primary opacity-70" data-ai-hint="document download" />
                <Button asChild size="lg" className="py-3.5 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground transition-all transform hover:scale-105 active:scale-95">
                  <a href={populatedDocumentDataUri} download={getDownloadFileName()}>
                    <Download className="mr-2 h-6 w-6" />
                    Download Translated Document
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <footer className="text-center py-6 border-t border-border mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LinguaLeap. Powered by Generative AI.
        </p>
      </footer>
    </div>
  );
}