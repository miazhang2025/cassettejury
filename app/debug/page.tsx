'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function DebugPage() {
  const { selectedJuries, apiKey, setApiKey } = useApp();
  const [testApiKey, setTestApiKey] = useState('');
  const [testQuestion, setTestQuestion] = useState('Do you prefer blue or red?');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Debug page - selectedJuries:', selectedJuries);
    console.log('Debug page - apiKey:', apiKey ? '***set***' : 'not set');
  }, [selectedJuries, apiKey]);

  const handleTestAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const keyToUse = testApiKey || apiKey;
    if (!keyToUse) {
      setError('Please enter an API key');
      setLoading(false);
      return;
    }

    if (selectedJuries.length === 0) {
      setError('No juries selected');
      setLoading(false);
      return;
    }

    try {
      const juryIds = selectedJuries.map((j) => j.id);
      console.log('Sending request with:', {
        question: testQuestion,
        juryIds,
        juryCount: selectedJuries.length,
      });

      const res = await fetch('/api/jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: testQuestion,
          juryIds,
          apiKey: keyToUse,
        }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        setError(data.error || `Error: ${res.status}`);
      } else {
        setResponse(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page</h1>

      <div style={{ marginBottom: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        <h2>Context State</h2>
        <p>
          <strong>Selected Juries:</strong> {selectedJuries.length}
        </p>
        {selectedJuries.length > 0 && (
          <ul>
            {selectedJuries.map((j) => (
              <li key={j.id}>
                {j.name} ({j.id})
              </li>
            ))}
          </ul>
        )}
        <p>
          <strong>API Key Set:</strong> {apiKey ? 'Yes' : 'No'}
        </p>
      </div>

      <div style={{ marginBottom: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        <h2>Test API</h2>
        <div>
          <label>
            API Key (optional, uses stored if not provided):
            <br />
            <input
              type="password"
              value={testApiKey}
              onChange={(e) => setTestApiKey(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
              placeholder="sk-ant-..."
            />
          </label>
        </div>
        <div>
          <label>
            Question:
            <br />
            <textarea
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              style={{ width: '100%', padding: '5px', minHeight: '80px' }}
            />
          </label>
        </div>
        <button
          onClick={handleTestAPI}
          disabled={loading || selectedJuries.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9B0808',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || selectedJuries.length === 0 ? 0.5 : 1,
          }}
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>

        {error && (
          <div style={{ marginTop: '10px', color: 'red', backgroundColor: '#ffe0e0', padding: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && (
          <div style={{ marginTop: '10px', color: 'green', backgroundColor: '#e0ffe0', padding: '10px' }}>
            <strong>Success!</strong>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p>
          <a href="/">Back to Home</a> | <a href="/jury">Go to Jury</a>
        </p>
      </div>
    </div>
  );
}
