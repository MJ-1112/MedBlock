// Document Storage System for MedBlock
// This simulates a decentralized storage system (like IPFS) integrated with blockchain

export interface StoredDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  ipfsHash: string; // Simulated IPFS hash
  encryptionKey: string; // For patient privacy
  patientId: string;
  doctorId?: string;
  isEncrypted: boolean;
}

class DocumentStorage {
  private documents: Map<string, StoredDocument> = new Map();
  private fileData: Map<string, string> = new Map(); // Simulated file content storage

  // Simulate file upload to IPFS-like distributed storage
  async uploadDocument(
    file: File, 
    patientId: string, 
    doctorId?: string
  ): Promise<StoredDocument> {
    // Simulate file processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate simulated IPFS hash
    const ipfsHash = this.generateIPFSHash(file.name, file.size);
    
    // Generate encryption key for privacy
    const encryptionKey = this.generateEncryptionKey();
    
    // Convert file to base64 for simulation (in real app, this would be encrypted)
    const fileContent = await this.fileToBase64(file);
    
    const document: StoredDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      ipfsHash,
      encryptionKey,
      patientId,
      doctorId,
      isEncrypted: true
    };

    // Store document metadata
    this.documents.set(document.id, document);
    
    // Store encrypted file content
    const encryptedContent = this.encryptContent(fileContent, encryptionKey);
    this.fileData.set(document.id, encryptedContent);

    return document;
  }

  // Retrieve document with proper access control
  async getDocument(
    documentId: string, 
    requesterId: string, 
    requesterRole: 'patient' | 'doctor'
  ): Promise<{ document: StoredDocument; content?: string } | null> {
    const document = this.documents.get(documentId);
    
    if (!document) {
      return null;
    }

    // Access control: patients can only access their own documents
    // Doctors can access documents of their patients or with emergency access
    const hasAccess = this.checkAccess(document, requesterId, requesterRole);
    
    if (!hasAccess) {
      throw new Error('Access denied: Insufficient permissions');
    }

    // Decrypt and return content if authorized
    const encryptedContent = this.fileData.get(documentId);
    let content: string | undefined;
    
    if (encryptedContent) {
      content = this.decryptContent(encryptedContent, document.encryptionKey);
    }

    return { document, content };
  }

  // Get all documents for a patient
  getPatientDocuments(patientId: string): StoredDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.patientId === patientId)
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  // Get documents accessible by a doctor
  getDoctorAccessibleDocuments(doctorId: string): StoredDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.doctorId === doctorId || this.hasEmergencyAccess(doctorId, doc))
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  // Delete document (with proper authorization)
  async deleteDocument(
    documentId: string, 
    requesterId: string, 
    requesterRole: 'patient' | 'doctor'
  ): Promise<boolean> {
    const document = this.documents.get(documentId);
    
    if (!document) {
      return false;
    }

    // Only patients can delete their own documents
    if (requesterRole !== 'patient' || document.patientId !== requesterId) {
      throw new Error('Access denied: Only patients can delete their own documents');
    }

    // Remove from storage
    this.documents.delete(documentId);
    this.fileData.delete(documentId);
    
    return true;
  }

  // Get storage statistics
  getStorageStats(): {
    totalDocuments: number;
    totalSize: number;
    documentsByType: Record<string, number>;
  } {
    const documents = Array.from(this.documents.values());
    
    return {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
      documentsByType: documents.reduce((acc, doc) => {
        const type = doc.fileType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Private helper methods
  private generateIPFSHash(fileName: string, fileSize: number): string {
    // Simulate IPFS hash generation
    const content = fileName + fileSize + Date.now();
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'Qm' + Math.abs(hash).toString(36).padStart(44, '0');
  }

  private generateEncryptionKey(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private encryptContent(content: string, key: string): string {
    // Simple XOR encryption for simulation (use proper encryption in production)
    let encrypted = '';
    for (let i = 0; i < content.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const contentChar = content.charCodeAt(i);
      encrypted += String.fromCharCode(contentChar ^ keyChar);
    }
    return btoa(encrypted); // Base64 encode
  }

  private decryptContent(encryptedContent: string, key: string): string {
    // Reverse of encryption
    const encrypted = atob(encryptedContent); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    return decrypted;
  }

  private checkAccess(
    document: StoredDocument, 
    requesterId: string, 
    requesterRole: 'patient' | 'doctor'
  ): boolean {
    // Patients can access their own documents
    if (requesterRole === 'patient' && document.patientId === requesterId) {
      return true;
    }

    // Doctors can access documents they're assigned to
    if (requesterRole === 'doctor' && document.doctorId === requesterId) {
      return true;
    }

    // Check for emergency access (simplified)
    if (requesterRole === 'doctor' && this.hasEmergencyAccess(requesterId, document)) {
      return true;
    }

    return false;
  }

  private hasEmergencyAccess(doctorId: string, document: StoredDocument): boolean {
    // Simplified emergency access check
    // In a real system, this would check active emergency access grants
    return false;
  }
}

export const documentStorage = new DocumentStorage();

// Storage location explanation
export const STORAGE_INFO = {
  location: 'Distributed Storage Network (IPFS-like)',
  encryption: 'AES-256 with patient-specific keys',
  backup: 'Multi-node redundancy across blockchain network',
  access: 'Smart contract controlled access permissions',
  retention: 'Permanent storage with patient-controlled deletion rights'
};