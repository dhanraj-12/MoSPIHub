import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import type { ChangeEvent, FormEvent } from 'react';
import { CloudUpload, CheckCircle, XCircle, ArrowRight, BookOpen, Loader } from 'lucide-react';
import BASE_URL from '../Config';

interface Survey {
    _id: string;
    survey_name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface UploadResponse {
    message: string;
    s3Key: string;
    jobId: string;
    statusCheckUrl: string;
}

interface TableJob {
    jobId: string;
    surveyTableName: string;
    status: 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    message: string;
    file: File;
    statusCheckUrl?: string;
}

const POLLING_INTERVAL_MS = 1000;

const SurveyWorkflow: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [surveyName, setSurveyName] = useState<string>('');
  const [createdSurvey, setCreatedSurvey] = useState<Survey | null>(null);
  const [newSurveyTableName, setNewSurveyTableName] = useState<string>('');
  const [newFile, setNewFile] = useState<File | null>(null); 
  const [tableJobs, setTableJobs] = useState<TableJob[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const resetFeedback = () => {
    setMessage('');
    setIsError(false);
  }

  const handleReset = () => {
      setStep(1);
      setSurveyName('');
      setCreatedSurvey(null);
      setNewSurveyTableName('');
      setNewFile(null);
      setTableJobs([]); 
      resetFeedback();
      const fileInput = document.getElementById('newCsvfile') as HTMLInputElement; 
      if (fileInput) {
          fileInput.value = '';
      }
  }

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const jobsToPoll = tableJobs.filter(
        job => job.status === 'PROCESSING' || job.status === 'PENDING'
    );

    if (jobsToPoll.length > 0 && intervalRef.current === null) {
      const intervalId = setInterval(pollJobStatuses, POLLING_INTERVAL_MS) as unknown as number;
      intervalRef.current = intervalId;
    } 
    else if (jobsToPoll.length === 0 && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tableJobs]); 

  const mapGoStatusToFrontend = (goStatus: string): TableJob['status'] => {
      const upperStatus = goStatus.toUpperCase();
      if (upperStatus === 'COMPLETED' || upperStatus === 'SUCCESS') { 
          return 'COMPLETED';
      }
      if (upperStatus === 'FAILED' || upperStatus === 'ERROR') {
          return 'FAILED';
      }
      return 'PROCESSING';
  }

  const pollJobStatuses = async () => {
      const activeJobs = tableJobs.filter(job => job.status === 'PROCESSING' || job.status === 'PENDING');

      await Promise.all(activeJobs.map(async (job) => {
          try {
              const response = await axios.get<{ jobId: string, status: { status: string, message?: string} | null}>(
                  `${BASE_URL}/status/${job.jobId}` 
              );

              const statusData = response.data.status;
              
              if (statusData && statusData.status) {
                  const resolvedStatus = mapGoStatusToFrontend(statusData.status);
                  const newMessage = statusData.message || job.message;

                  if (resolvedStatus !== job.status) {
                      setTableJobs(prevJobs => prevJobs.map(prevJob =>
                          prevJob.jobId === job.jobId
                              ? { ...prevJob, status: resolvedStatus, message: newMessage }
                              : prevJob
                      ));
                  }
              }

          } catch (error) {
              console.error(`Error polling status for job ${job.jobId}:`, error);
              setTableJobs(prevJobs => prevJobs.map(prevJob =>
                  prevJob.jobId === job.jobId
                      ? { ...prevJob, status: 'FAILED', message: 'Polling failed: Check network/API connectivity.' }
                      : prevJob
              ));
          }
      }));
  };

  const handleCreateSurvey = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFeedback();
    if (!surveyName.trim()) {
      setIsError(true);
      setMessage('Survey name is required.');
      return;
    }

    try {
      setIsBusy(true);
      const response = await axios.post<{ message: string, data: Survey }>(
        `${BASE_URL}/addsurvey`, 
        { survey_name: surveyName }
      );
      
      setCreatedSurvey(response.data.data);
      setStep(2); 
      setMessage(`Survey "${response.data.data.survey_name}" created! You can now upload tables.`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message;
      setIsError(true);
      setMessage(`Survey creation failed: ${errorMessage}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleNewFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            alert("Please select a valid CSV file.");
            setNewFile(null);
            e.target.value = '';
        } else {
            setNewFile(selectedFile);
        }
    } else {
        setNewFile(null);
    }
    resetFeedback();
  };

  const handleUploadTable = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFeedback();
    
    if (!newSurveyTableName.trim() || !newFile || !createdSurvey?._id) {
      setIsError(true);
      setMessage('Table Name and a CSV file are required.');
      return;
    }
    
    const tempJob: TableJob = {
        jobId: `temp-${Date.now()}`,
        surveyTableName: newSurveyTableName,
        status: 'UPLOADING',
        message: 'Client-side upload in progress...',
        file: newFile,
    };
    
    setTableJobs(prev => [tempJob, ...prev]);
    
    const formData = new FormData();
    formData.append('survey_table_name', newSurveyTableName);
    formData.append('surveyId', createdSurvey._id); 
    formData.append('csvfile', newFile); 

    try {
      setIsBusy(true);
      const response = await axios.post<UploadResponse>(
        `${BASE_URL}/addtable`,
        formData,
        {} 
      );
      
      setTableJobs(prevJobs => prevJobs.map(job =>
          job.jobId === tempJob.jobId
              ? { 
                  ...job, 
                  jobId: response.data.jobId, 
                  status: 'PENDING',
                  message: 'Upload complete. Processing job initiated...',
                  statusCheckUrl: response.data.statusCheckUrl 
                }
              : job
      ));

      setMessage(`Table "${newSurveyTableName}" submitted! Job ID: ${response.data.jobId}.`);
      
      setNewSurveyTableName('');
      setNewFile(null);
      (document.getElementById('newCsvfile') as HTMLInputElement).value = '';
      
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message;
        setIsError(true);
        setMessage(`Upload for table "${newSurveyTableName}" failed: ${errorMessage}`);
        
        setTableJobs(prevJobs => prevJobs.map(job =>
            job.jobId === tempJob.jobId
                ? { ...job, status: 'FAILED', message: errorMessage }
                : job
        ));

    } finally {
      setIsBusy(false);
    }
  };
  
  const renderStatusIcon = (status: TableJob['status']) => {
      switch (status) {
          case 'COMPLETED':
              return <CheckCircle className="w-5 h-5 text-green-500" />;
          case 'FAILED':
              return <XCircle className="w-5 h-5 text-red-500" />;
          case 'UPLOADING':
          case 'PROCESSING':
          case 'PENDING':
              return <Loader className="w-5 h-5 text-gray-400 animate-spin" />;
          default:
              return <CheckCircle className="w-5 h-5 text-gray-400" />;
      }
  }

  const renderJobTable = () => (
    <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-3">Processing Queue ({tableJobs.length} Tables)</h4>
        
        <div className="border border-gray-600 rounded-lg max-h-60 overflow-y-auto bg-gray-800/50 backdrop-blur-sm">
            {tableJobs.length === 0 ? (
                <p className="p-4 text-gray-400 text-sm">Add your first table file above.</p>
            ) : (
                <ul className="divide-y divide-gray-600">
                    {tableJobs.map((job) => (
                        <li key={job.jobId} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-700/50 transition duration-150">
                            
                            <div className="flex items-center space-x-3 w-full sm:w-2/3">
                                {renderStatusIcon(job.status)}
                                <div>
                                    <p className="font-medium text-gray-100">{job.surveyTableName}</p>
                                    <p className="text-xs text-gray-400">{job.file.name}</p>
                                </div>
                            </div>
                            
                            <div className="mt-2 sm:mt-0 w-full sm:w-1/3 text-right">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    job.status === 'COMPLETED' ? 'bg-green-900/50 text-green-300 border border-green-800' :
                                    job.status === 'FAILED' ? 'bg-red-900/50 text-red-300 border border-red-800' :
                                    'bg-gray-700 text-gray-300 border border-gray-600'
                                }`}>
                                    {job.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        <button 
            type="button" 
            onClick={() => setStep(3)}
            disabled={tableJobs.length === 0 || tableJobs.some(j => j.status === 'PROCESSING' || j.status === 'UPLOADING' || j.status === 'PENDING')}
            className={`mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition duration-150 ${
                tableJobs.length === 0 || tableJobs.some(j => j.status === 'PROCESSING' || j.status === 'UPLOADING' || j.status === 'PENDING')
                ? 'bg-gray-600 cursor-not-allowed text-gray-400 border border-gray-600'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600 hover:border-gray-500'
            }`}
        >
            {tableJobs.some(j => j.status === 'PROCESSING' || j.status === 'UPLOADING' || j.status === 'PENDING')
                ? `Waiting for ${tableJobs.filter(j => j.status === 'PROCESSING' || j.status === 'UPLOADING' || j.status === 'PENDING').length} job(s) to finish...`
                : 'Finish Workflow'
            }
        </button>
    </div>
  );

  const renderStepOne = () => (
    <form onSubmit={handleCreateSurvey} className="space-y-6 p-6 bg-gray-800/70 backdrop-blur-md rounded-lg border border-gray-700">
      <div className="flex items-center space-x-2 text-lg font-semibold text-gray-100">
        <BookOpen className="w-5 h-5 text-gray-300" />
        <h3>Create New Survey</h3>
      </div>
      <div>
        <label htmlFor="surveyName" className="block text-sm font-medium text-gray-300 mb-2">
          Survey Name
        </label>
        <input
          type="text"
          id="surveyName"
          value={surveyName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => { setSurveyName(e.target.value); resetFeedback(); }}
          placeholder="e.g., Annual Customer Satisfaction"
          className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition duration-150 bg-gray-700/50 text-gray-100 placeholder-gray-400"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isBusy}
        className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white transition duration-150 ${
          isBusy ? 'bg-gray-600 cursor-not-allowed border border-gray-600' : 'bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
        }`}
      >
        {isBusy ? 'Creating Survey...' : 'Create Survey'}
        {!isBusy && <ArrowRight className='w-4 h-4 ml-2' />}
      </button>
    </form>
  );

  const renderStepTwo = () => (
    <>
        <div className="p-4 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg mb-6">
            <p className="text-sm font-medium">
                Current Survey: {createdSurvey?.survey_name}
            </p>
            <p className="text-xs text-gray-400 mt-1">
                Survey ID: {createdSurvey?._id}
            </p>
        </div>

        <form onSubmit={handleUploadTable} className="space-y-4 p-6 rounded-lg bg-gray-800/70 backdrop-blur-md border border-gray-700">
            <h4 className='text-lg font-semibold text-gray-100 flex items-center'>
                <CloudUpload className='w-5 h-5 mr-2 text-gray-300'/> 
                Add New Table File
            </h4>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label htmlFor="newSurveyTableName" className="block text-sm font-medium text-gray-300 mb-2">Table Name</label>
                    <input
                        type="text"
                        id="newSurveyTableName"
                        value={newSurveyTableName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSurveyTableName(e.target.value)}
                        placeholder="e.g., Q1_2024_Data_Clean"
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition duration-150 bg-gray-700/50 text-gray-100 placeholder-gray-400"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="newCsvfile" className="block text-sm font-medium text-gray-300 mb-2">Select CSV File</label>
                    <input 
                        id="newCsvfile" 
                        type="file" 
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 transition duration-150" 
                        onChange={handleNewFileChange}
                        accept=".csv"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isBusy || !newFile}
                className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium text-white transition duration-150 ${
                  isBusy || !newFile ? 'bg-gray-600 cursor-not-allowed border border-gray-600' : 'bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
                }`}
            >
                {isBusy ? 'Submitting...' : 'Upload Table'}
            </button>
        </form>

        {renderJobTable()}
        
        <button 
            type="button" 
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-gray-200 transition duration-150 mt-4 text-center w-full"
        >
            Start Over
        </button>
    </>
  );

  const renderSuccess = () => (
    <div className='text-center p-8'>
        <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Workflow Complete</h3>
        <p className="text-gray-400 mb-6">
            All tables have been submitted and processed.
        </p>
        
        {renderJobTable()}

        <button 
            type="button" 
            onClick={handleReset}
            className="mt-6 py-2 px-6 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition duration-150 border border-gray-600 hover:border-gray-500"
        >
            Start New Workflow
        </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="relative z-10 max-w-xl w-full bg-gray-800/70 backdrop-blur-md rounded-xl border border-gray-700 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-100 text-center">
            Survey Data Uploader
        </h1>
        
        <div className="flex justify-between items-center mb-6">
            <div className={`flex-1 text-center py-2 border-b-2 ${step >= 1 ? 'border-gray-300 text-gray-100' : 'border-gray-600 text-gray-500'}`}>
                Create Survey
            </div>
            <div className={`flex-1 text-center py-2 border-b-2 ${step >= 2 ? 'border-gray-300 text-gray-100' : 'border-gray-600 text-gray-500'}`}>
                Add Tables
            </div>
            <div className={`flex-1 text-center py-2 border-b-2 ${step >= 3 ? 'border-gray-300 text-gray-100' : 'border-gray-600 text-gray-500'}`}>
                Complete
            </div>
        </div>

        <div className="min-h-[400px]">
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderSuccess()}
        </div>

        {(message) && (
          <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 border ${
            isError ? 'bg-red-900/30 text-red-300 border-red-800/50' : 'bg-green-900/30 text-green-300 border-green-800/50'
          }`}>
            {isError ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyWorkflow;