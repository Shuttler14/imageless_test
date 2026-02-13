import React from 'react';
import ReactDOM from 'react-dom/client';
import ZeroGravityCloset from './ZeroGravityCloset';

// Function to mount the app
window.mountZeroGravityCloset = (elementId, props) => {
    const rootElement = document.getElementById(elementId);
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <ZeroGravityCloset {...props} />
            </React.StrictMode>
        );
        return () => root.unmount(); // Return cleanup function
    } else {
        console.error(`Root element #${elementId} not found.`);
        return null;
    }
};
