import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation - API Generator',
  description: 'API Generator documentation and guides',
}

export default function Documentation() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Documentation
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <h2>Getting Started</h2>
          <p>
            Welcome to the API Generator documentation. This guide will help you 
            understand how to create and manage APIs using our platform.
          </p>
          
          <h2>Creating Your First API</h2>
          <p>
            To create your first API, navigate to the dashboard and click on the 
            "Create New API" button. Follow the step-by-step wizard to configure 
            your API endpoints.
          </p>
          
          <h2>API Configuration</h2>
          <p>
            Each API can be configured with custom endpoints, authentication methods, 
            and data validation rules. Use the visual editor to design your API 
            structure.
          </p>
          
          <h2>Deployment</h2>
          <p>
            Once your API is ready, you can deploy it with a single click. 
            Your API will be available at a unique URL that you can use in 
            your applications.
          </p>
        </div>
      </div>
    </div>
  )
}