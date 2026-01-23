import { useState } from 'react';
import { Button } from './ui/button';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setResult(null);

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d858e34/seed-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Seed data created:', data);
        setResult({ 
          success: true, 
          message: `Successfully created: ${data.counts.companies} companies, ${data.counts.users} users, ${data.counts.buses} buses, ${data.counts.schedules} schedules, ${data.counts.tickets} tickets` 
        });
      } else {
        const error = await response.text();
        console.error('Seed data error:', error);
        setResult({ success: false, message: `Error: ${error}` });
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      setResult({ success: false, message: `Error: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-start gap-3">
        <Database className="w-5 h-5 text-[#0077B6] mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Database Seed Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            The statistics are showing zero because there's no data in the database yet. Click below to populate with demo data.
          </p>
          
          <Button
            onClick={handleSeedData}
            disabled={loading || (result?.success === true)}
            className="w-full bg-[#0077B6] hover:bg-[#005a8c]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {result?.success ? 'Data Already Seeded' : 'Generate Demo Data'}
          </Button>

          {result && (
            <div className={`mt-3 p-2 rounded flex items-start gap-2 text-sm ${
              result.success 
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {result.success ? (
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span className="flex-1">{result.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
