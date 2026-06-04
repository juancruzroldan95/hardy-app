## 2025-02-05 - Missing HTML Sanitization in Email Templates
**Vulnerability:** Found unescaped user inputs directly interpolated into an HTML string payload sent to the Resend API for the `solicitudes` (access requests) form.
**Learning:** Even if the input does not interact directly with a SQL database (which is protected by DrizzleORM) or the main UI, injecting it directly into HTML email templates represents an XSS risk or HTML injection where attackers can misrepresent email content or execute scripts in vulnerable email clients.
**Prevention:** Always sanitize/escape user inputs before interpolating them into HTML strings, even for internal emails. Use standard libraries like `html-escaper`.
