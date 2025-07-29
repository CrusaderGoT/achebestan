import DOMPurify from "isomorphic-dompurify";

// clean content html
export const sanitizeHTML = (html: string | Node) =>
    DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
