import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Camera, 
  Check, 
  AlertCircle,
  Loader2,
  HardDrive,
  Shield,
  Globe
} from 'lucide-react';
import { MedicalRecord } from '../../types';
import { healthcareBlockchain } from '../../utils/blockchain';
import { documentStorage, STORAGE_INFO } from '../../utils/storage';
import { getCurrentUser } from '../../utils/auth';

export const UploadDocuments: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [recordType, setRecordType] = useState<'prescription' | 'test_report'>('prescription');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);

  const currentUser = getCurrentUser();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || uploadedFiles.length === 0 || !title.trim()) return;

    setIsUploading(true);
    
    try {
      // Upload document to distributed storage
      const storedDocument = await documentStorage.uploadDocument(
        uploadedFiles[0],
        currentUser.id
      );
      
      // Create medical record for blockchain
      const record: MedicalRecord = {
        id: `record-${Date.now()}`,
        patientId: currentUser.id,
        doctorId: '', // Will be assigned by doctor
        type: recordType,
        title: title.trim(),
        description: description.trim(),
        fileName: storedDocument.fileName,
        fileUrl: storedDocument.ipfsHash, // IPFS hash as URL
        blockchainHash: '',
        timestamp: new Date().toISOString()
      };

      // Add to blockchain
      healthcareBlockchain.addRecord(record);
      
      setUploadedDocument(storedDocument);
      setUploadSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setUploadedFiles([]);
        setTitle('');
        setDescription('');
        setUploadSuccess(false);
        setUploadedDocument(null);
      }, 5000);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess && uploadedDocument) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your document has been securely stored and is now part of your permanent medical record.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Storage Location</span>
              </div>
              <p className="text-sm text-blue-800">Distributed Network (IPFS)</p>
              <p className="text-xs text-blue-600 mt-1 font-mono">
                {uploadedDocument.ipfsHash.substring(0, 20)}...
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Encryption</span>
              </div>
              <p className="text-sm text-green-800">AES-256 Encrypted</p>
              <p className="text-xs text-green-600 mt-1">Patient-controlled keys</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Blockchain Confirmation:</strong> Your record has been added to the blockchain 
              with immutable proof of authenticity and timestamp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Medical Documents</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Document Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRecordType('prescription')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  recordType === 'prescription'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Prescription</div>
              </button>
              
              <button
                type="button"
                onClick={() => setRecordType('test_report')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  recordType === 'test_report'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Camera className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Test Report</div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Document Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter document title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes or description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Document *
            </label>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your files here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    multiple
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Supports: PDF, Images, Word documents (Max 10MB each)
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Secure Storage Information</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Stored on distributed network (IPFS-like)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>End-to-end encrypted with your private keys</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4" />
                    <span>Blockchain-verified integrity and authenticity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || uploadedFiles.length === 0 || !title.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading to Secure Storage...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload to Blockchain</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Where Your Documents Are Stored</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Distributed Network</p>
                <p className="text-sm text-gray-600">Files stored across multiple nodes for redundancy</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">End-to-End Encryption</p>
                <p className="text-sm text-gray-600">Only you and authorized doctors can decrypt</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <HardDrive className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Blockchain Verified</p>
                <p className="text-sm text-gray-600">Immutable proof of document authenticity</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Patient Controlled</p>
                <p className="text-sm text-gray-600">You maintain full control over access permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};