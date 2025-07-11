// frontend/src/App.js (Final Version with Footer)

import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

import {
  Container, Box, Typography, TextField, Button,
  Card, CardContent, IconButton, Snackbar, Alert
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { Code, ContentCopy, Download } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as syntaxTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript-web');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPreview, setShowPreview] = useState(false); 

  const languages = [
    { id: 'javascript-web', label: 'JS Web Page',  },
    { id: 'html', label: 'HTML',  },
    { id: 'javascript', label: 'JavaScript',  },
    { id: 'python', label: 'Python',  }
  ];

  const generateCode = async () => {
    if (!prompt.trim()) {
      setSnackbar({ open: true, message: 'Please enter a description', severity: 'warning' });
      return;
    }
    setLoading(true);
    setGeneratedCode('');
    setShowPreview(false);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/generate';
      const response = await axios.post(apiUrl, {
        prompt,
        language: selectedLanguage
      });
      setGeneratedCode(response.data.code);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error generating code. Please try again.', severity: 'error' });
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setSnackbar({ open: true, message: 'Code copied!', severity: 'success' });
  };

  const downloadCode = () => {
    const fileExtension = selectedLanguage === 'javascript-web' ? 'html' : selectedLanguage;
    const element = document.createElement('a');
    const file = new Blob([generatedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `generated-code.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const canShowPreview = selectedLanguage === 'html' || selectedLanguage === 'javascript-web';

  return (
    <Container maxWidth="xl" className="app-container">
      <Box className="header">
        {/* --- MODIFIED HEADER --- */}
        <Typography variant="h1"><Code /> SMS AI Code Generator</Typography>
        <Typography variant="subtitle1">Systematic Modelling Solution </Typography>
      </Box>

      <Card className="code-generation-card">
        <CardContent>
          <Box className="language-selector">
            {languages.map(lang => (
              <Button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                variant={selectedLanguage === lang.id ? 'contained' : 'outlined'}
                startIcon={<span>{lang.icon}</span>}
              >
                {lang.label}
              </Button>
            ))}
          </Box>
          <TextField
            className="prompt-input" fullWidth multiline rows={4} variant="outlined"
            placeholder="E.g., A simple to-do list app with an add button"
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
          />
          <Box className="button-group-container" sx={{ mt: 2 }}>
            <LoadingButton onClick={generateCode} loading={loading} variant="contained" size="large" sx={{ flexGrow: 1 }}>
              Generate Code
            </LoadingButton>
            <Button variant="outlined" size="large" onClick={() => setShowPreview(!showPreview)} disabled={!generatedCode || !canShowPreview}>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {generatedCode && (
        <div className="row mt-4">
          <div className={showPreview && canShowPreview ? 'col-lg-6' : 'col-12'}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Generated Code</Typography>
                  <Box>
                    <IconButton onClick={copyToClipboard} color="primary" title="Copy"><ContentCopy /></IconButton>
                    <IconButton onClick={downloadCode} color="primary" title="Download"><Download /></IconButton>
                  </Box>
                </Box>
                <Box sx={{ height: 450, overflow: 'auto', background: '#282c34', borderRadius: 1 }}>
                  <SyntaxHighlighter language={selectedLanguage === 'javascript-web' ? 'html' : selectedLanguage} style={syntaxTheme} showLineNumbers customStyle={{ margin: 0, height: '100%' }}>
                    {generatedCode}
                  </SyntaxHighlighter>
                </Box>
              </CardContent>
            </Card>
          </div>
          {showPreview && canShowPreview && (
            <div className="col-lg-6">
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Live Preview</Typography>
                  <iframe
                    className="code-preview-iframe"
                    srcDoc={generatedCode}
                    title="Live Preview"
                    sandbox="allow-scripts allow-forms"
                    style={{ height: '495px' }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* --- THIS IS THE NEW FOOTER SECTION --- */}
      <Box component="footer" sx={{ textAlign: 'center', mt: 5, py: 3, borderTop: '1px solid #333' }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 SMS Code Generator. All rights reserved.
        </Typography>
      </Box>
      
    </Container>
  );
}

export default App;