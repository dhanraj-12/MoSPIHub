import React from 'react';
import { PlusCircle, Search, Database, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleAddSurvey = () => {
        navigate('/upload-workflow');
    };

    const handleQuerySurveys = () => {
        navigate('/query-surveys');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 font-sans text-gray-200 relative overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

            <div className="relative z-10 text-center mb-16 max-w-4xl w-full">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center justify-center bg-gray-800/80 backdrop-blur-md px-8 py-5 rounded-2xl border border-gray-700 shadow-lg">
                            <Database className="w-10 h-10 mr-4 text-gray-300" />
                            <h1 className="text-5xl font-bold text-gray-100 tracking-tight">
                                MospiHub
                            </h1>
                        </div>
                    </div>
                    
                    {/* Tagline */}
                    <div className="max-w-3xl mx-auto">
                        <p className="text-2xl font-light text-gray-300 mb-6 leading-relaxed">
                            Enterprise Data Management Platform
                        </p>
                        <div className="h-px w-24 bg-gray-700 mx-auto mb-8"></div>
                        <p className="text-lg text-gray-400 font-normal leading-relaxed">
                            Streamline your data workflow with secure, scalable processing and advanced analytics capabilities. 
                            Designed for enterprise-scale statistical operations.
                        </p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
                    {[
                        { icon: Shield, label: 'Enterprise Security', value: 'SOC2 Compliant' },
                        { icon: Zap, label: 'Processing', value: 'Real-time Analytics' },
                        { icon: BarChart3, label: 'Data Scale', value: 'PB+ Capacity' }
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center p-5 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                            <item.icon className="w-6 h-6 text-gray-400 mb-2" />
                            <div className="text-gray-300 font-medium text-sm mb-1">{item.label}</div>
                            <div className="text-gray-500 text-xs">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Actions Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-20">
                {/* Data Workflow Card */}
                <button
                    onClick={handleAddSurvey}
                    className="flex flex-col items-start justify-between p-8 bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg 
                             transition-all duration-300 hover:bg-gray-800/90 hover:border-gray-600 h-full w-full text-left group"
                >
                    <div className="w-full">
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-gray-700/50 rounded-lg mr-4 group-hover:bg-gray-700/70 transition-colors">
                                <PlusCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-100">
                                Data Workflow
                            </h2>
                        </div>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Initiate new data processing workflows with secure CSV upload, validation, 
                            and integration into our distributed processing pipeline.
                        </p>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-gray-300 font-medium group-hover:text-gray-200 transition-colors">
                            Start Workflow
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                </button>

                {/* Data Analytics Card */}
                <button
                    onClick={handleQuerySurveys}
                    className="flex flex-col items-start justify-between p-8 bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg 
                             transition-all duration-300 hover:bg-gray-800/90 hover:border-gray-600 h-full w-full text-left group"
                >
                    <div className="w-full">
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-gray-700/50 rounded-lg mr-4 group-hover:bg-gray-700/70 transition-colors">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-100">
                                Data Analytics
                            </h2>
                        </div>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Access processed survey data with powerful query capabilities, 
                            advanced filtering, and comprehensive analytics tools.
                        </p>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-gray-300 font-medium group-hover:text-gray-200 transition-colors">
                            Explore Data
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                </button>
            </div>

            {/* Feature Tags */}
            <div className="relative z-10 max-w-3xl w-full mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {['Data Validation', 'Batch Processing', 'API Integration', 'Audit Logging'].map((feature) => (
                        <div key={feature} className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/30">
                            <div className="text-gray-400 font-medium text-sm">{feature}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 text-center w-full max-w-2xl">
                <div className="h-px w-full bg-gray-800 mb-8"></div>
                <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 mb-6">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <span className="text-sm">ISO 27001 Certified</span>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span className="text-sm">GDPR Compliant</span>
                    </div>
                    <div className="text-sm">
                        v2.4.1 • Production
                    </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                    MospiHub Data Platform &copy; {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    );
};

export default HomePage;