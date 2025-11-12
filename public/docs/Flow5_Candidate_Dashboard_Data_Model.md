# Flow 5 - Candidate Dashboard
## Data Structure & Modelling Documentation

---

## Overview

Flow 5 is the post-certification candidate dashboard that serves as the final destination after completing onboarding and contract signature. This flow provides a simplified, finished-state view that confirms contract certification, provides access to final documents, and celebrates the candidate's successful journey. It represents the completion of the entire contracting lifecycle from the candidate's perspective.

---

## Core Data Models

### 1. CandidateDashboard
The main dashboard state and configuration for a certified candidate.

```typescript
interface CandidateDashboard {
  id: string;
  candidateId: string;
  status: DashboardStatus;
  
  // Certification Details
  certificationRecord: CertificationSummary;
  
  // Documents
  documents: DashboardDocument[];
  
  // Profile
  profile: CandidateProfileSummary;
  
  // Notifications & Updates
  notifications: DashboardNotification[];
  unreadCount: number;
  
  // UI State
  celebrationShown: boolean;            // One-time confetti animation
  lastAccessedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

type DashboardStatus = 
  | 'certified'                         // Contract fully certified
  | 'active'                            // Currently working
  | 'suspended'                         // Temporarily suspended
  | 'terminated';                       // Contract ended
```

---

### 2. CertificationSummary
Summary of the candidate's contract certification.

```typescript
interface CertificationSummary {
  id: string;
  candidateId: string;
  certificateNumber: string;            // Unique certificate ID
  
  // Certification Details
  certifiedAt: Date;
  certifiedBy: string;                  // Admin user who certified
  expiresAt?: Date;                     // If contract has expiration
  
  // Contract Information
  contractTitle: string;                // E.g., "Employment Agreement"
  contractType: 'employee' | 'contractor';
  startDate: Date;
  endDate?: Date;                       // If fixed-term
  
  // Key Terms (displayed on dashboard)
  keyTerms: CertificationKeyTerm[];
  
  // Status
  isActive: boolean;
  isCertified: boolean;
  
  // URLs
  certificateUrl: string;               // Certificate PDF
  contractBundleUrl: string;            // Signed contract bundle PDF
  
  createdAt: Date;
}

interface CertificationKeyTerm {
  id: string;
  label: string;                        // E.g., "Position", "Start Date", "Salary"
  value: string;                        // E.g., "Senior Developer", "Jan 15, 2025", "$85,000"
  category: 'role' | 'compensation' | 'dates' | 'location' | 'other';
}
```

---

### 3. DashboardDocument
Documents available for download on the dashboard.

```typescript
interface DashboardDocument {
  id: string;
  candidateId: string;
  type: DocumentType;
  title: string;
  description?: string;
  
  // File Details
  fileUrl: string;                      // Download URL
  fileSize: number;                     // Bytes
  mimeType: string;                     // E.g., "application/pdf"
  
  // Status
  status: DocumentStatus;
  
  // Timestamps
  uploadedAt: Date;
  lastDownloadedAt?: Date;
  downloadCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

type DocumentType = 
  | 'signed_contract_bundle'            // Complete signed contract
  | 'certificate_of_contract'           // Certification document
  | 'employee_handbook'                 // Company handbook
  | 'tax_form'                          // W-2, W-8BEN, etc.
  | 'benefits_summary'                  // Benefits package details
  | 'company_policy'                    // Policies
  | 'other';

type DocumentStatus = 
  | 'ready'                             // Available for download
  | 'processing'                        // Being generated
  | 'expired'                           // No longer valid
  | 'revoked';                          // Removed by admin
```

---

### 4. CandidateProfileSummary
Simplified profile information displayed on the dashboard.

```typescript
interface CandidateProfileSummary {
  id: string;
  candidateId: string;
  
  // Identity
  fullName: string;
  email: string;
  phoneNumber: string;
  
  // Employment
  role: string;
  department?: string;
  employmentType: 'employee' | 'contractor';
  startDate: Date;
  
  // Location
  workLocation: 'remote' | 'hybrid' | 'onsite';
  timezone: string;
  city?: string;
  country?: string;
  
  // Manager (if applicable)
  managerName?: string;
  managerEmail?: string;
  
  // Status
  isActive: boolean;
  profileComplete: boolean;
  
  // Avatar
  avatarUrl?: string;
  
  updatedAt: Date;
}
```

---

### 5. DashboardNotification
Notifications and updates displayed on the dashboard.

```typescript
interface DashboardNotification {
  id: string;
  candidateId: string;
  type: NotificationType;
  priority: NotificationPriority;
  
  // Content
  title: string;
  message: string;
  actionLabel?: string;                 // E.g., "View Document"
  actionUrl?: string;                   // Link to action
  
  // Status
  read: boolean;
  readAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  
  // Display
  icon?: string;                        // Icon name or emoji
  color?: string;                       // Badge color
  
  // Expiration
  expiresAt?: Date;                     // Auto-remove after date
  
  createdAt: Date;
}

type NotificationType = 
  | 'welcome'                           // Welcome message
  | 'document_ready'                    // New document available
  | 'action_required'                   // Requires attention
  | 'reminder'                          // Reminder notification
  | 'update'                            // General update
  | 'announcement'                      // Company announcement
  | 'celebration';                      // Celebration message

type NotificationPriority = 
  | 'high'                              // Red/urgent
  | 'medium'                            // Yellow/important
  | 'low';                              // Blue/informational
```

---

### 6. DashboardActivity
Activity log of candidate's interactions with the dashboard.

```typescript
interface DashboardActivity {
  id: string;
  candidateId: string;
  activityType: ActivityType;
  
  // Activity Details
  description: string;
  metadata?: Record<string, any>;       // Additional context
  
  // Tracking
  ipAddress?: string;
  userAgent?: string;
  
  timestamp: Date;
}

type ActivityType = 
  | 'dashboard_accessed'                // Logged in
  | 'document_downloaded'               // Downloaded file
  | 'document_viewed'                   // Viewed document
  | 'notification_read'                 // Read notification
  | 'profile_viewed'                    // Viewed profile
  | 'support_contacted'                 // Contacted support
  | 'feedback_submitted';               // Submitted feedback
```

---

## State Management

### Dashboard State
```typescript
interface DashboardState {
  // Data
  dashboard: CandidateDashboard;
  certification: CertificationSummary;
  documents: DashboardDocument[];
  notifications: DashboardNotification[];
  profile: CandidateProfileSummary;
  
  // UI State
  isLoading: boolean;
  showCelebration: boolean;             // Confetti animation
  selectedDocument: DashboardDocument | null;
  
  // Filters
  documentFilter: 'all' | DocumentType;
  notificationFilter: 'all' | 'unread';
  
  // Actions
  downloadDocument: (documentId: string) => Promise<void>;
  viewCertificate: () => void;
  markNotificationRead: (notificationId: string) => Promise<void>;
  refreshDashboard: () => Promise<void>;
}
```

### Celebration Animation State
```typescript
interface CelebrationState {
  triggered: boolean;                   // Has animation been shown
  triggeredAt?: Date;                   // When it was shown
  
  // Animation Config
  duration: number;                     // Milliseconds (default: 3000)
  confettiCount: number;                // Number of particles
  
  // One-time trigger
  shouldShow: boolean;                  // Show on this page load
}

// Celebration triggers on:
// 1. First visit to dashboard after certification
// 2. URL parameter ?celebrate=true
// 3. Never shown automatically again after first time
```

---

## User Flow & Experience

### Phase 1: Dashboard Access
1. Candidate completes Flow 4 (Onboarding)
2. Clicks "Finish & Launch" button
3. Redirected directly to dashboard URL
4. No intermediate "Onboarding Complete" screen

### Phase 2: First Dashboard Load (Celebration)
1. Dashboard loads with gradient background
2. Confetti animation triggers automatically
3. Header displays: "Welcome aboard, [First Name]!"
4. Subtext: "Your contract is fully certified."
5. Animation plays once for 3 seconds
6. Dashboard content fades in

### Phase 3: Dashboard Overview
1. **Header Section**:
   - Welcome message with candidate's first name
   - Certification status badge
   - Profile summary (role, location, start date)

2. **Contract Certified Card** (removed - was duplicate):
   - Previously showed summary with action buttons
   - Now removed to simplify and avoid duplication

3. **Documents & Certificate Section**:
   - Clean list of available documents
   - Two primary documents always shown:
     - "Signed Contract Bundle – Ready → [Download]"
     - "Certificate of Contract – Ready → [View Certificate]"
   - Additional documents (handbook, policies) shown below
   - Clear status indicators (Ready, Processing, etc.)
   - Download buttons with icons

4. **Notifications Panel** (optional):
   - Welcome message
   - Important updates
   - Action items (if any)

### Phase 4: Document Actions
1. **View Certificate**:
   - Opens certificate in modal or new tab
   - Shows certificate number, certification date
   - Displays candidate details and contract summary
   - Provides download option

2. **Download Contract Bundle**:
   - Downloads PDF of complete signed contract
   - Includes all documents from bundle
   - Logs download activity
   - Shows success toast

### Phase 5: Ongoing Usage
1. Candidate returns to dashboard anytime via URL
2. No celebration animation on subsequent visits
3. Can re-download documents as needed
4. View notifications and updates
5. Access profile information
6. Contact support if needed

---

## Document Structure

### Signed Contract Bundle Contents
```typescript
interface ContractBundleContents {
  bundleId: string;
  generatedAt: Date;
  
  // Cover Page
  coverPage: {
    title: string;                      // "Employment Agreement Bundle"
    candidateName: string;
    companyName: string;
    certificateNumber: string;
    certificationDate: Date;
  };
  
  // Main Documents
  documents: [
    {
      title: "Employment Agreement",
      pages: number;
      signatures: Signature[];          // Candidate + Admin signatures
    },
    {
      title: "Non-Disclosure Agreement",
      pages: number;
      signatures: Signature[];
    },
    {
      title: "Data Privacy Addendum",
      pages: number;
      signatures: Signature[];
    },
    // Additional country-specific documents...
  ];
  
  // Signature Summary Page
  signatureSummary: {
    candidateSignature: {
      name: string;
      email: string;
      signedAt: Date;
      ipAddress: string;
    };
    adminSignature: {
      name: string;
      title: string;
      signedAt: Date;
    };
  };
  
  // Footer on Every Page
  footer: {
    certificateNumber: string;
    pageNumber: string;                 // "Page X of Y"
    generatedDate: Date;
  };
}
```

### Certificate of Contract Structure
```typescript
interface CertificateOfContract {
  certificateNumber: string;
  
  // Header
  title: "Certificate of Contract";
  subtitle: "This certifies that the employment agreement has been fully executed";
  
  // Candidate Information
  candidate: {
    fullName: string;
    role: string;
    startDate: Date;
    employmentType: string;
  };
  
  // Company Information
  company: {
    name: string;
    address: string;
    registrationNumber?: string;
  };
  
  // Certification Details
  certification: {
    certifiedBy: string;              // Admin name
    certifiedAt: Date;
    verificationHash: string;         // For authenticity
  };
  
  // Contract Summary
  contractSummary: {
    contractType: string;
    executionDate: Date;              // When both parties signed
    documents: string[];              // List of document titles
  };
  
  // QR Code (optional)
  qrCode?: string;                    // URL to verify certificate
  
  // Signatures
  signatures: {
    candidateSignature: string;       // Image or text
    adminSignature: string;
    companyStamp?: string;            // If applicable
  };
}
```

---

## Validation & Access Control

### Dashboard Access Rules
```typescript
const canAccessDashboard = (candidate: Candidate): boolean => {
  return (
    candidate.onboardingCompleted &&
    candidate.contractSigned &&
    candidate.certifiedAt !== null &&
    candidate.status === 'certified'
  );
};

// If not certified, redirect to appropriate flow
const determinRedirect = (candidate: Candidate): string => {
  if (!candidate.formSubmitted) {
    return '/candidate/form';          // Flow 3
  }
  if (!candidate.onboardingCompleted) {
    return '/candidate/onboarding';    // Flow 4
  }
  if (!candidate.contractSigned) {
    return '/candidate/signature';     // Signature flow
  }
  return '/candidate/dashboard';       // Flow 5
};
```

### Document Access Validation
```typescript
const canDownloadDocument = (
  candidateId: string,
  documentId: string
): boolean => {
  const document = getDocument(documentId);
  
  return (
    document.candidateId === candidateId &&
    document.status === 'ready' &&
    !document.expired
  );
};
```

---

## Integration Points

### 1. Certification Service (Flow 2 Integration)
Fetches certification details and status.

```typescript
interface FetchCertificationRequest {
  candidateId: string;
}

interface FetchCertificationResponse {
  certification: CertificationSummary;
  documents: DashboardDocument[];
  isActive: boolean;
}

const fetchCertification = async (
  candidateId: string
): Promise<CertificationSummary> => {
  const response = await fetch(`/api/certifications/${candidateId}`);
  return response.json();
};
```

### 2. Document Service
Handles document downloads and viewing.

```typescript
const downloadDocument = async (
  candidateId: string,
  documentId: string
): Promise<Blob> => {
  const response = await fetch(
    `/api/documents/${documentId}/download`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  // Log download activity
  await logActivity(candidateId, 'document_downloaded', { documentId });
  
  return response.blob();
};

const viewCertificate = async (
  candidateId: string
): Promise<string> => {
  // Returns URL to certificate PDF
  const response = await fetch(`/api/certifications/${candidateId}/certificate`);
  const { url } = await response.json();
  
  // Log view activity
  await logActivity(candidateId, 'document_viewed', { type: 'certificate' });
  
  return url;
};
```

### 3. Notification Service
Manages dashboard notifications.

```typescript
const fetchNotifications = async (
  candidateId: string,
  filter: 'all' | 'unread' = 'all'
): Promise<DashboardNotification[]> => {
  const response = await fetch(
    `/api/candidates/${candidateId}/notifications?filter=${filter}`
  );
  return response.json();
};

const markNotificationRead = async (
  notificationId: string
): Promise<void> => {
  await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};
```

### 4. Activity Tracking Service
Logs all dashboard activities.

```typescript
const logActivity = async (
  candidateId: string,
  activityType: ActivityType,
  metadata?: Record<string, any>
): Promise<void> => {
  await fetch('/api/activities', {
    method: 'POST',
    body: JSON.stringify({
      candidateId,
      activityType,
      metadata,
      timestamp: new Date(),
    }),
  });
};
```

---

## Security & Privacy

### Authentication
- Token-based authentication (JWT)
- Session management with refresh tokens
- Auto-logout after inactivity (30 minutes)
- Secure cookie storage

### Data Protection
- All documents encrypted at rest
- Download URLs are time-limited (15 minutes)
- Signed URLs for document access
- Audit log of all document downloads

### Access Control
- Candidates can only access their own data
- Documents scoped to candidateId
- Rate limiting on document downloads
- IP logging for security monitoring

---

## Database Schema

### Tables Required
1. `candidate_dashboards` - Dashboard configurations
2. `certification_records` - Certification details
3. `dashboard_documents` - Available documents
4. `dashboard_notifications` - Notifications
5. `dashboard_activities` - Activity logs
6. `candidate_profiles` - Profile summaries

### Relationships
- Dashboard 1:1 Candidate
- Dashboard 1:1 CertificationRecord
- Dashboard 1:N DashboardDocuments
- Dashboard 1:N DashboardNotifications
- Dashboard 1:N DashboardActivities

---

## Performance Considerations

### Optimization Strategies
1. Cache dashboard data with SWR (stale-while-revalidate)
2. Lazy load documents (fetch metadata first, download on-demand)
3. Pre-generate certificate PDFs (background job)
4. CDN for document delivery
5. Pagination for notifications (if many)
6. Background job for activity logging (non-blocking)
7. Optimistic UI for notification reads

### Caching Strategy
```typescript
const dashboardCache = {
  key: `dashboard-${candidateId}`,
  ttl: 300,                             // 5 minutes
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};
```

---

## Analytics & Tracking

### Key Metrics
```typescript
interface DashboardAnalytics {
  // Engagement
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;           // Seconds
  
  // Document Usage
  documentDownloads: Record<DocumentType, number>;
  certificateViews: number;
  avgDownloadsPerUser: number;
  
  // Notifications
  notificationReadRate: number;
  avgTimeToReadNotification: number;    // Hours
  
  // Satisfaction
  feedbackSubmissions: number;
  averageRating?: number;
}
```

---

## UI Components

### Dashboard Layout
```typescript
const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient">
      {/* Celebration Animation (one-time) */}
      {showCelebration && <ConfettiAnimation />}
      
      {/* Header */}
      <DashboardHeader 
        candidateName={profile.fullName}
        certificationStatus="Certified"
      />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Documents & Certificate Section */}
        <DocumentsSection
          documents={documents}
          certification={certification}
          onDownload={handleDownload}
          onViewCertificate={handleViewCertificate}
        />
        
        {/* Notifications (optional) */}
        {notifications.length > 0 && (
          <NotificationsPanel
            notifications={notifications}
            onMarkRead={handleMarkRead}
          />
        )}
      </main>
    </div>
  );
};
```

### Document Card Component
```typescript
interface DocumentCardProps {
  document: DashboardDocument;
  onDownload: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDownload }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{document.title}</CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </div>
          <Badge variant={document.status === 'ready' ? 'success' : 'secondary'}>
            {document.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => onDownload(document.id)}
          disabled={document.status !== 'ready'}
        >
          Download
        </Button>
      </CardContent>
    </Card>
  );
};
```

---

## Error Handling

### Common Scenarios
1. **Dashboard Not Accessible**: Redirect to appropriate flow
2. **Document Download Failure**: Retry with exponential backoff
3. **Certificate Not Found**: Show error message, contact support
4. **Session Expired**: Redirect to login with return URL
5. **Network Error**: Show offline indicator, queue actions

---

## Future Enhancements

1. **Onboarding Checklist**: Post-certification tasks (e.g., "Join Slack", "Schedule 1:1")
2. **Team Directory**: View team members and org chart
3. **Benefits Portal**: Enroll in benefits, view coverage
4. **Time Off Requests**: Request PTO, view balance
5. **Payroll Access**: View pay stubs, update banking
6. **Learning & Development**: Access training materials
7. **Performance Reviews**: View feedback, set goals
8. **Company News Feed**: Updates and announcements
9. **Chat Support**: Live chat with HR/support
10. **Mobile App**: Native iOS/Android app

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-14  
**Flow Status**: 🔒 Locked - Production Ready
