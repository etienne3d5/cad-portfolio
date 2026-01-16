// ==============================================================
// CHILI3D VIEWER MODE - Minimal UI (Viewport + Left Sidebar Only)
// ==============================================================
// Save this as: public/viewer-mode.js
// Then add to public/index.html: <script src="viewer-mode.js"></script>

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initViewerMode);
    } else {
        initViewerMode();
    }

    function initViewerMode() {
        console.log('🔒 Viewer Mode: Activating...');
        
        // Inject CSS to create minimal viewer UI
        injectViewerStyles();
        
        // Wait for the UI to load, then apply changes
        setTimeout(() => {
            hideUIElements();
            disableEditingCommands();
            makeDocumentReadOnly();
        }, 500);

        // Keep observing for dynamic UI changes
        observeDOMChanges();
        
        console.log('✅ Viewer Mode: Active - Minimal UI');
    }

    function injectViewerStyles() {
        const style = document.createElement('style');
        style.id = 'viewer-mode-styles';
        style.textContent = `
            /* ============================================
               HIDE ALL TOP UI ELEMENTS
               ============================================ */
            
            /* Hide the entire ribbon/toolbar area */
            .ribbon,
            .ribbon-container,
            .toolbar,
            .toolbar-container,
            .top-bar,
            .command-bar,
            .menu-bar:not(.viewer-menu),
            [class*="ribbon"],
            [class*="toolbar"],
            header:has(button),
            nav:has(button) {
                display: none !important;
            }

            /* Hide all tabs (Startup, Sketch, Tools, etc.) */
            [role="tablist"],
            [role="tab"],
            .tabs-container,
            .tab-bar,
            [class*="tab"]:not([class*="viewport"]) {
                display: none !important;
            }

            /* Hide all command buttons and groups */
            [data-command],
            .command-button,
            .command-group,
            .ribbon-group,
            .tool-group,
            button[title*="Box"],
            button[title*="Cylinder"],
            button[title*="Sphere"],
            button[title*="Extrude"],
            button[title*="Rotate"],
            button[title*="Move"] {
                display: none !important;
            }

            /* Hide the title bar / app header */
            .title-bar,
            .app-header,
            .window-header,
            header.header {
                display: none !important;
            }

            /* Hide undo/redo and other top controls */
            button[title*="Undo"],
            button[title*="Redo"],
            .history-controls {
                display: none !important;
            }

            /* ============================================
               KEEP ONLY VIEWPORT AND LEFT SIDEBAR
               ============================================ */
            
            /* FORCE left sidebar to be visible - Items and Properties panels */
            .sidebar,
            .left-panel,
            .items-panel,
            .properties-panel,
            [class*="sidebar"],
            [class*="panel-left"],
            [class*="items"],
            [class*="properties"],
            div:has(> h3:contains("Items")),
            div:has(> h3:contains("Properties")) {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            /* Make sure left sidebar has proper layout */
            .sidebar {
                position: relative !important;
                width: auto !important;
                min-width: 200px !important;
                max-width: 350px !important;
                height: 100% !important;
            }

            /* Ensure viewport is visible and fills remaining space */
            .viewport,
            .canvas-container,
            .view-container,
            canvas,
            [class*="viewport"],
            [class*="canvas"] {
                display: block !important;
                visibility: visible !important;
            }

            /* Make the main container adjust to new layout */
            body, #root, .app, .main-container {
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Adjust layout to remove top space */
            .layout-container,
            .app-layout,
            .main-layout {
                padding-top: 0 !important;
                margin-top: 0 !important;
            }

            /* ============================================
               MAKE INPUTS READ-ONLY
               ============================================ */
            
            input, textarea, select {
                pointer-events: none !important;
                background: #2a2a2a !important;
                opacity: 0.7 !important;
            }

            /* ============================================
               VIEWER MODE INDICATOR
               ============================================ */
            
            body::before {
                content: "🔒 VIEWER MODE";
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(74, 158, 255, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                z-index: 999999;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            /* ============================================
               HIDE RIGHT SIDEBAR / PROPERTIES IF NEEDED
               ============================================ */
            
            /* Uncomment if you want to hide the right properties panel too */
            /*
            .properties-panel,
            .right-panel,
            [class*="panel-right"] {
                display: none !important;
            }
            */

            /* ============================================
               SPECIFIC CHILI3D SELECTORS
               ============================================ */
            
            /* Hide specific Chili3D UI elements based on your screenshots */
            div[style*="background"][style*="rgb(45, 45, 45)"] > div:first-child,
            div[style*="display: flex"][style*="padding"] > button {
                display: none !important;
            }

            /* Clean up any floating buttons */
            button:not(.sidebar button):not(.panel button) {
                display: none !important;
            }

            /* Hide Working Plane, Group, Tools panels at the top */
            div[style*="gap: 8px"] > div:has(button) {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function hideUIElements() {
        // Aggressively hide top UI elements by traversing the DOM
        const topElements = document.querySelectorAll('header, nav, [role="toolbar"], [role="navigation"]');
        topElements.forEach(el => {
            // Check if it's a top element (not in sidebar)
            const rect = el.getBoundingClientRect();
            if (rect.top < 100 && rect.left > 300) {
                el.style.display = 'none';
            }
        });

        // Hide any element that looks like a toolbar
        document.querySelectorAll('div').forEach(div => {
            const style = window.getComputedStyle(div);
            const bgColor = style.backgroundColor;
            const height = parseInt(style.height);
            
            // If it's a horizontal bar at the top with buttons
            if (height < 100 && height > 30 && div.getBoundingClientRect().top < 100) {
                const hasButtons = div.querySelectorAll('button').length > 3;
                if (hasButtons) {
                    div.style.display = 'none';
                }
            }
        });

        // Remove specific UI sections by their content
        const toolNames = [
            'Startup', 'Sketch', 'Tools', 'Line', 'Arc', 'Rectangle',
            'Box', 'Cylinder', 'Sphere', 'Cone', 'Pyramid',
            'Extrude', 'Rotate', 'Move', 'Fillet', 'Chamfer',
            'Working Plane', 'Boolean', 'Group', 'Projection'
        ];

        document.querySelectorAll('div, button, span').forEach(el => {
            const text = el.textContent?.trim();
            if (text && toolNames.includes(text) && el.getBoundingClientRect().top < 150) {
                // Hide the element and its parent container
                el.style.display = 'none';
                if (el.parentElement) {
                    el.parentElement.style.display = 'none';
                }
            }
        });
    }

    function disableEditingCommands() {
        // Block all editing commands
        const blockedCommands = [
            'create', 'new', 'edit', 'delete', 'remove',
            'box', 'cylinder', 'sphere', 'cone', 'pyramid',
            'extrude', 'revolve', 'sweep', 'loft',
            'boolean', 'union', 'difference', 'intersection',
            'fillet', 'chamfer', 'trim', 'split', 'offset',
            'mirror', 'rotate', 'move', 'scale', 'transform',
            'sketch', 'line', 'circle', 'arc', 'rectangle',
            'save', 'undo', 'redo', 'modify', 'array'
        ];

        // Intercept various command execution methods
        ['executeCommand', 'runCommand', 'execute'].forEach(methodName => {
            if (window[methodName] && typeof window[methodName] === 'function') {
                const original = window[methodName];
                window[methodName] = function(commandName, ...args) {
                    if (blockedCommands.some(cmd => commandName?.toLowerCase().includes(cmd))) {
                        console.warn(`🔒 Viewer Mode: Command "${commandName}" is disabled`);
                        return false;
                    }
                    return original.call(this, commandName, ...args);
                };
            }
        });

        // Try to intercept app/chili command systems
        setTimeout(() => {
            const paths = [
                'chili.executeCommand',
                'app.executeCommand', 
                'application.executeCommand',
                'window.chili.executeCommand'
            ];

            paths.forEach(path => {
                try {
                    const parts = path.split('.');
                    let obj = window;
                    
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!obj[parts[i]]) return;
                        obj = obj[parts[i]];
                    }
                    
                    const methodName = parts[parts.length - 1];
                    const original = obj[methodName];
                    
                    if (typeof original === 'function') {
                        obj[methodName] = function(commandName, ...args) {
                            if (blockedCommands.some(cmd => commandName?.toLowerCase().includes(cmd))) {
                                console.warn(`🔒 Blocked: ${commandName}`);
                                return false;
                            }
                            return original.call(this, commandName, ...args);
                        };
                    }
                } catch (e) {
                    // Ignore errors for paths that don't exist
                }
            });
        }, 1000);
    }

    function makeDocumentReadOnly() {
        // Disable all input fields
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.readOnly = true;
        });

        // Block keyboard shortcuts for editing
        document.addEventListener('keydown', function(e) {
            // Block Ctrl+Z (undo), Ctrl+Y (redo), Ctrl+S (save), Delete
            if ((e.ctrlKey || e.metaKey) && ['z', 'y', 's'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                e.stopPropagation();
                console.warn('🔒 Viewer Mode: Keyboard shortcut disabled');
                return false;
            }
            
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Allow in input fields, but nowhere else
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        }, true);
    }

    function observeDOMChanges() {
        // Watch for dynamically added UI elements
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // Re-hide elements when new ones are added
                    setTimeout(hideUIElements, 100);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Expose control functions
    window.viewerMode = {
        enabled: true,
        disable: function() {
            const style = document.getElementById('viewer-mode-styles');
            if (style) style.remove();
            location.reload();
        },
        refresh: function() {
            hideUIElements();
        }
    };

})();