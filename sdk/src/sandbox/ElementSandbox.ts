/**
 * ElementSandbox
 * Provides isolation and security for element execution
 */

import { ElementPermissions, ElementAPI } from '../interfaces';

export class ElementSandbox {
  private iframe?: HTMLIFrameElement;
  private permissions: ElementPermissions;
  private elementId: string;
  private messageHandlers: Map<string, Function> = new Map();
  private messageListener?: (event: MessageEvent) => void;
  private channelAttached: boolean = false;

  constructor(elementId: string, permissions: ElementPermissions) {
    this.elementId = elementId;
    this.permissions = permissions;
  }

  /**
   * Create the sandbox iframe
   */
  createSandbox(container: HTMLElement): void {
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox.add('allow-scripts');
    
    // Add permissions based on element requirements
    if (this.permissions.clipboard) {
      this.iframe.sandbox.add('allow-clipboard-read');
      this.iframe.sandbox.add('allow-clipboard-write');
    }

    // Also set CSP attribute on iframe (for non-srcdoc loads)
    this.iframe.setAttribute('csp', this.getCSP());
    
    // Style the iframe
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    
    // Setup message channel
    this.setupMessageChannel();
    
    container.appendChild(this.iframe);
  }

  /**
   * Load element code into the sandbox
   */
  loadElement(code: string, styles?: string): void {
    if (!this.iframe || !this.iframe.contentWindow) {
      throw new Error('Sandbox not created');
    }

    const csp = this.getCSP();
    
    // Neutralize breakout sequences in code and styles
    const safeCode = this.neutralizeBreakouts(code);
    const safeStyles = styles ? this.neutralizeBreakouts(styles) : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          ${safeStyles ? `<style>${safeStyles}</style>` : ''}
          <script>
            // Element API proxy
            window.elementAPI = ${this.createAPIProxy()};
            
            // Message handler
            window.addEventListener('message', (event) => {
              if (event.source !== window.parent) return;
              
              const { type, id, method, args } = event.data;
              
              if (type === 'api-response') {
                const resolver = window.__apiResolvers[id];
                if (resolver) {
                  resolver(args[0]);
                  delete window.__apiResolvers[id];
                }
              }
            });
            
            window.__apiResolvers = {};
            window.__apiId = 0;
          </script>
        </head>
        <body>
          <div id="element-root"></div>
          <script>${safeCode}</script>
        </body>
      </html>
    `;

    this.iframe.srcdoc = html;
  }

  /**
   * Neutralize </script> and </style> breakout sequences
   */
  private neutralizeBreakouts(input: string): string {
    return input
      .replace(/<\/script>/gi, '<\\/script>')
      .replace(/<\/style>/gi, '<\\/style>');
  }

  /**
   * Destroy the sandbox
   */
  destroy(): void {
    // Remove the message listener before removing iframe
    if (this.messageListener && window.removeEventListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = undefined;
    }
    
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = undefined;
    }
    this.messageHandlers.clear();
    this.channelAttached = false;
  }

  /**
   * Send message to the element
   */
  sendMessage(type: string, data: any): void {
    if (!this.iframe || !this.iframe.contentWindow) {
      throw new Error('Sandbox not created');
    }
    
    this.iframe.contentWindow.postMessage({
      type,
      data
    }, '*');
  }

  /**
   * Register a message handler
   */
  onMessage(type: string, handler: Function): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Setup message channel for communication
   */
  private setupMessageChannel(): void {
    // Don't attach if already attached
    if (this.channelAttached) return;
    
    // Create a named listener function for proper removal
    this.messageListener = (event: MessageEvent) => {
      if (event.source !== this.iframe?.contentWindow) return;
      
      const { type, data } = event.data;
      const handler = this.messageHandlers.get(type);
      
      if (handler) {
        handler(data);
      }
    };
    
    window.addEventListener('message', this.messageListener);
    this.channelAttached = true;
  }

  /**
   * Get Content Security Policy - selects exactly one connect-src directive
   */
  private getCSP(): string {
    const policies = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
    ];

    if (this.permissions.network === true) {
      // Network permission granted - allow all connections
      return policies.concat("connect-src *").join('; ');
    } else {
      // No network permission - block all connections
      return policies.concat("connect-src 'none'").join('; ');
    }
  }

  /**
   * Create API proxy for the element
   */
  private createAPIProxy(): string {
    const methods = [
      'getPortfolio',
      'getTransactions',
      'getPrices',
      'saveData',
      'loadData',
      'sendNotification',
      'analyzeImage',
      'analyzeToken',
      'emit',
      'on'
    ];

    const proxy: any = {};
    
    methods.forEach(method => {
      proxy[method] = `function(...args) {
        return new Promise((resolve) => {
          const id = window.__apiId++;
          window.__apiResolvers[id] = resolve;
          
          window.parent.postMessage({
            type: 'api-call',
            id,
            method: '${method}',
            args
          }, '*');
        });
      }`;
    });

    return `{${Object.entries(proxy).map(([k, v]) => `${k}: ${v}`).join(',')}}`;
  }
}