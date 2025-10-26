'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
});

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface TASTemplate {
  id: number;
  name: string;
  description: string;
  template_type: string;
  template_type_display: string;
  aqf_level: string;
  aqf_level_display: string;
  structure: any;
  default_sections: string[];
  gpt_prompts: Record<string, string>;
  is_active: boolean;
  is_system_template: boolean;
  created_by: number;
  created_by_details: User;
  created_at: string;
  updated_at: string;
}

interface TAS {
  id: number;
  tenant: number;
  title: string;
  code: string;
  description: string;
  qualification_name: string;
  aqf_level: string;
  aqf_level_display: string;
  training_package: string;
  template: number | null;
  template_details: TASTemplate | null;
  sections: any[];
  status: string;
  status_display: string;
  version: number;
  is_current_version: boolean;
  gpt_generated: boolean;
  gpt_generation_date: string | null;
  gpt_model_used: string;
  gpt_tokens_used: number;
  generation_time_seconds: number;
  content: any;
  metadata: any;
  time_saved: {
    traditional_hours: number;
    gpt_hours: number;
    saved_hours: number;
    percentage_saved: number;
  } | null;
  version_count: number;
  created_by: number;
  created_by_details: User;
  created_at: string;
  updated_at: string;
}

interface TASVersion {
  id: number;
  tas: number;
  version_number: number;
  change_summary: string;
  changed_sections: string[];
  content_diff: any;
  was_regenerated: boolean;
  regeneration_reason: string;
  created_by: number;
  created_by_details: User;
  created_at: string;
}

interface GenerationLog {
  id: number;
  tas: number;
  status: string;
  status_display: string;
  model_version: string;
  tokens_total: number;
  generation_time_seconds: number;
  error_message: string;
  created_at: string;
  completed_at: string | null;
}

export default function TASGeneratorPage({ params }: { params: { tenantSlug: string } }) {
  const [documents, setDocuments] = useState<TAS[]>([]);
  const [templates, setTemplates] = useState<TASTemplate[]>([]);
  const [qualifications, setQualifications] = useState<Array<{
    code: string;
    title: string;
    aqf_level: string;
    training_package: string;
  }>>([]);
  const [loadingQualifications, setLoadingQualifications] = useState(false);
  const [qualificationSearch, setQualificationSearch] = useState('');
  const [unitsData, setUnitsData] = useState<any>(null);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<TAS | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplatesListModal, setShowTemplatesListModal] = useState(false);
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TASTemplate | null>(null);
  const [versions, setVersions] = useState<TASVersion[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'approved' | 'published'>('all');
  const [generating, setGenerating] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState<'create' | 'edit'>('create');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    qualification_name: '',
    training_package: '',
    sections: [] as any[],
    units_of_competency: [] as Array<{ code: string; title: string }>,
    status: 'draft',
    create_version: false,
    change_summary: '',
  });

  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    template_id: null as number | null,
    code: '',
    qualification_name: '',
    aqf_level: 'certificate_iii',
    training_package: '',
    delivery_mode: 'Face-to-face',
    duration_weeks: 52,
    units_of_competency: [] as Array<{ code: string; title: string }>,
    assessment_methods: [] as string[],
    additional_context: '',
    use_gpt4: true,
    ai_model: 'gpt-4o', // Default to GPT-4o
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    template_type: 'general',
    aqf_level: 'certificate_iii',
    structure: {},
    default_sections: [] as string[],
    gpt_prompts: {} as Record<string, string>,
    is_active: true,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Load TAS documents from API
  const loadTASDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tenants/${params.tenantSlug}/tas/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('TAS Documents API response:', data);
        
        // Handle both array and paginated response formats
        if (Array.isArray(data)) {
          setDocuments(data);
        } else if (data.results && Array.isArray(data.results)) {
          // DRF paginated response
          setDocuments(data.results);
        } else {
          console.error('Unexpected TAS documents response format:', data);
        }
      } else {
        console.error('Failed to load TAS documents:', response.status);
      }
    } catch (error) {
      console.error('Error loading TAS documents:', error);
    }
  };

  // Delete a TAS document
  const handleDeleteTAS = async (doc: TAS) => {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tenants/${params.tenantSlug}/tas/${doc.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 204) {
        alert('✅ TAS document deleted successfully!');
        // Reload the list
        await loadTASDocuments();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete' }));
        alert(`❌ Failed to delete TAS document:\n\n${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting TAS:', error);
      alert(`❌ Error deleting TAS document:\n\n${error}`);
    }
  };

  // Open edit modal with document data
  const handleEditDocument = (doc: TAS) => {
    console.log('🔧 Opening edit modal for doc:', doc.id);
    console.log('📄 Document sections:', doc.sections);
    console.log('📊 Sections count:', doc.sections?.length || 0);
    
    setSelectedDocument(doc);
    setEditForm({
      title: doc.title || '',
      description: doc.description || '',
      qualification_name: doc.qualification_name || '',
      training_package: doc.training_package || '',
      sections: doc.sections || [],
      units_of_competency: doc.metadata?.units_of_competency || [],
      status: doc.status || 'draft',
      create_version: false,
      change_summary: '',
    });
    
    console.log('✅ Edit form initialized with sections:', doc.sections?.length || 0);
    
    setShowPreviewModal(false); // Close preview modal if open
    setShowEditModal(true);
  };

  // Save edited document
  const handleSaveEdit = async () => {
    if (!selectedDocument) return;

    if (editForm.create_version && !editForm.change_summary.trim()) {
      alert('⚠️ Please provide a change summary when creating a new version');
      return;
    }

    setSavingEdit(true);

    try {
      const response = await fetch(
        `${API_URL}/api/tenants/${params.tenantSlug}/tas/${selectedDocument.id}/update-content/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Edit response:', data);
        
        alert(
          editForm.create_version
            ? `✅ New version created successfully!\n\nVersion: ${data.version}\n\n${data.message}`
            : `✅ Document updated successfully!\n\n${data.message}`
        );
        
        setShowEditModal(false);
        setSelectedDocument(null);
        
        // Reload documents
        await loadTASDocuments();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update' }));
        console.error('Update error:', errorData);
        alert(`❌ Failed to update document:\n\n${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      console.error('Error updating document:', error);
      alert(`❌ Error updating document:\n\n${error}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Update section content
  const updateSectionContent = useCallback((index: number, newContent: string) => {
    setEditForm(prevForm => {
      const updatedSections = [...prevForm.sections];
      if (updatedSections[index]) {
        updatedSections[index] = {
          ...updatedSections[index],
          content: newContent,
        };
      }
      return { ...prevForm, sections: updatedSections };
    });
  }, []);

  // Load templates from API
  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch(`${API_URL}/api/tenants/${params.tenantSlug}/tas/templates/`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Templates API response:', data);
        
        // Handle both array and paginated response formats
        if (Array.isArray(data)) {
          setTemplates(data);
        } else if (data.results && Array.isArray(data.results)) {
          // DRF paginated response
          setTemplates(data.results);
        } else if (data.data && Array.isArray(data.data)) {
          // Custom paginated response
          setTemplates(data.data);
        } else {
          console.error('Unexpected API response format:', data);
          loadMockTemplates();
        }
      } else {
        console.error('Failed to load templates. Status:', response.status);
        // Fallback to mock data
        loadMockTemplates();
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to mock data
      loadMockTemplates();
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Load mock templates as fallback
  const loadMockTemplates = () => {
    setTemplates([
      {
        id: 1,
        name: 'Standard Diploma Template',
        description: 'Standard template for Diploma level qualifications',
        template_type: 'business',
        template_type_display: 'Business/Commerce',
        aqf_level: 'diploma',
        aqf_level_display: 'Diploma',
        structure: {},
        default_sections: [
          'qualification_overview',
          'target_group',
          'entry_requirements',
          'learning_outcomes',
          'units_of_competency',
          'delivery_strategy',
          'assessment_strategy',
          'resources',
          'trainer_requirements',
          'aqf_alignment',
        ],
        gpt_prompts: {},
        is_active: true,
        is_system_template: true,
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'system',
          email: 'system@example.com',
          first_name: 'System',
          last_name: 'Admin',
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Certificate III Template',
        description: 'Standard template for Certificate III qualifications',
        template_type: 'general',
        template_type_display: 'General Template',
        aqf_level: 'certificate_iii',
        aqf_level_display: 'Certificate III',
        structure: {},
        default_sections: [],
        gpt_prompts: {},
        is_active: true,
        is_system_template: true,
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'system',
          email: 'system@example.com',
          first_name: 'System',
          last_name: 'Admin',
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ]);
  };

  // Load qualifications from training.gov.au
  const loadQualifications = async () => {
    setLoadingQualifications(true);
    try {
      const response = await fetch(`${API_URL}/api/tenants/${params.tenantSlug}/tas/qualifications/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Qualifications API response:', data);
        
        // Handle both array and paginated response formats
        if (Array.isArray(data)) {
          setQualifications(data);
        } else if (data.results && Array.isArray(data.results)) {
          setQualifications(data.results);
        } else if (data.data && Array.isArray(data.data)) {
          setQualifications(data.data);
        } else {
          console.error('Unexpected qualifications response format:', data);
          // Fallback to mock data
          loadMockQualifications();
        }
      } else {
        console.error('Failed to load qualifications. Status:', response.status);
        loadMockQualifications();
      }
    } catch (error) {
      console.error('Error loading qualifications:', error);
      loadMockQualifications();
    } finally {
      setLoadingQualifications(false);
    }
  };

  // Load mock qualifications as fallback
  const loadMockQualifications = () => {
    setQualifications([
      { code: 'BSB50120', title: 'Diploma of Business', aqf_level: 'diploma', training_package: 'BSB' },
      { code: 'BSB40120', title: 'Certificate IV in Business', aqf_level: 'certificate_iv', training_package: 'BSB' },
      { code: 'ICT50220', title: 'Diploma of Information Technology', aqf_level: 'diploma', training_package: 'ICT' },
      { code: 'ICT40120', title: 'Certificate IV in Information Technology', aqf_level: 'certificate_iv', training_package: 'ICT' },
      { code: 'CHC50113', title: 'Diploma of Early Childhood Education and Care', aqf_level: 'diploma', training_package: 'CHC' },
      { code: 'CHC43015', title: 'Certificate IV in Ageing Support', aqf_level: 'certificate_iv', training_package: 'CHC' },
      { code: 'SIT50416', title: 'Diploma of Hospitality Management', aqf_level: 'diploma', training_package: 'SIT' },
      { code: 'SIT40516', title: 'Certificate IV in Commercial Cookery', aqf_level: 'certificate_iv', training_package: 'SIT' },
    ]);
  };

  // Load units of competency for a qualification
  const loadUnitsForQualification = async (qualCode: string) => {
    console.log('🔍 Loading units for qualification:', qualCode);
    setLoadingUnits(true);
    setUnitsData(null);
    setSelectedUnits([]);
    
    try {
      const url = `${API_URL}/api/tenants/${params.tenantSlug}/tas/units/?qualification_code=${qualCode}`;
      console.log('📡 Fetching units from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📨 Units response status:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Units data loaded:', data);
        console.log('📚 Number of groupings:', data.groupings?.length);
        setUnitsData(data);
        
        // Auto-select all core units
        if (data.groupings) {
          const coreUnits = data.groupings
            .filter((g: any) => g.type === 'core')
            .flatMap((g: any) => g.units.map((u: any) => u.code));
          console.log('🔒 Auto-selected core units:', coreUnits);
          setSelectedUnits(coreUnits);
        }
      } else if (response.status === 404) {
        console.warn('⚠️ No units data available for:', qualCode);
        // Set a special marker to show "no units available" message
        setUnitsData({ not_available: true, qualification_code: qualCode });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load units. Status:', response.status);
        console.error('❌ Error response:', errorText);
        setUnitsData(null);
      }
    } catch (error) {
      console.error('💥 Error loading units:', error);
      setUnitsData(null);
    } finally {
      console.log('✋ Loading units complete');
      setLoadingUnits(false);
    }
  };

  // Toggle unit selection
  const toggleUnitSelection = (unitCode: string) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitCode)) {
        return prev.filter(code => code !== unitCode);
      } else {
        return [...prev, unitCode];
      }
    });
  };

  // Select all units in a grouping
  const selectAllInGrouping = (grouping: any) => {
    const unitCodes = grouping.units.map((u: any) => u.code);
    setSelectedUnits(prev => {
      const allSelected = unitCodes.every((code: string) => prev.includes(code));
      if (allSelected) {
        // Deselect all
        return prev.filter(code => !unitCodes.includes(code));
      } else {
        // Select all
        return [...new Set([...prev, ...unitCodes])];
      }
    });
  };


  // Mock data for demonstration
  useEffect(() => {
    loadTemplates();
    loadQualifications();
    loadTASDocuments();
  }, []);

  const handleGenerate = async () => {
    console.log('🚀 handleGenerate called');
    console.log('📝 Generate form data:', generateForm);
    console.log('📚 Selected units:', selectedUnits);
    
    // Build units_of_competency from selected units
    const selectedUnitsData = unitsData?.groupings
      .flatMap((g: any) => g.units)
      .filter((u: any) => selectedUnits.includes(u.code))
      .map((u: any) => ({ code: u.code, title: u.title })) || [];
    
    const requestData = {
      ...generateForm,
      units_of_competency: selectedUnitsData,
    };
    
    console.log('📦 Request data:', requestData);
    
    setGenerating(true);
    
    try {
      const url = `http://localhost:8000/api/tenants/${params.tenantSlug}/tas/generate/`;
      console.log('📡 Calling API:', url);
      console.log('📦 Request body:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log('✅ Success response:', data);
      
      setGenerating(false);
      setShowGenerateModal(false);
      
      // Show success message with generation details
      alert(
        `✅ ${data.message || 'TAS generated successfully!'}\n\n` +
        `📊 Generation Details:\n` +
        `- Model Used: ${generateForm.ai_model.toUpperCase()}\n` +
        `- Generation Time: ${data.generation_log?.generation_time_seconds?.toFixed(1) || 'N/A'} seconds\n` +
        `- Tokens Used: ${data.generation_log?.tokens_total || 'N/A'}\n` +
        `- TAS ID: ${data.tas?.id}\n\n` +
        `🎉 Your TAS document is ready!`
      );
      
      // Reset form
      setGenerateForm({
        template_id: null,
        code: '',
        qualification_name: '',
        aqf_level: 'certificate_iii',
        training_package: '',
        delivery_mode: 'Face-to-face',
        duration_weeks: 52,
        units_of_competency: [],
        assessment_methods: [],
        additional_context: '',
        use_gpt4: true,
        ai_model: 'gpt-4o',
      });
      
      // Clear units data
      setUnitsData(null);
      setSelectedUnits([]);
      setQualificationSearch('');
      
      // Reload the TAS documents list to show the new document
      console.log('🔄 Reloading TAS documents...');
      await loadTASDocuments();
      console.log('✅ TAS documents reloaded');
      
    } catch (err: any) {
      setGenerating(false);
      console.error('❌ Generation error:', err);
      
      // Parse error message
      let errorMessage = 'Failed to generate TAS document.';
      try {
        const errorObj = JSON.parse(err.message);
        if (typeof errorObj === 'object') {
          errorMessage = Object.entries(errorObj)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        }
      } catch {
        errorMessage = err.message || errorMessage;
      }
      
      alert(`❌ Generation Failed:\n\n${errorMessage}`);
    }
  };

  const addUnit = () => {
    setGenerateForm({
      ...generateForm,
      units_of_competency: [
        ...generateForm.units_of_competency,
        { code: '', title: '' },
      ],
    });
  };

  const updateUnit = (index: number, field: 'code' | 'title', value: string) => {
    const units = [...generateForm.units_of_competency];
    units[index][field] = value;
    setGenerateForm({ ...generateForm, units_of_competency: units });
  };

  const removeUnit = (index: number) => {
    const units = generateForm.units_of_competency.filter((_, i) => i !== index);
    setGenerateForm({ ...generateForm, units_of_competency: units });
  };

  const handleCreateTemplate = () => {
    setTemplateFormMode('create');
    setSelectedTemplate(null); // Clear any selected template
    setTemplateForm({
      name: '',
      description: '',
      template_type: 'general',
      aqf_level: 'certificate_iii',
      structure: {},
      default_sections: [],
      gpt_prompts: {},
      is_active: true,
    });
    setShowTemplatesListModal(false); // Close templates list modal
    setShowTemplateFormModal(true); // Open template form modal
  };

  const handleEditTemplate = (template: TASTemplate) => {
    setTemplateFormMode('edit');
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      template_type: template.template_type,
      aqf_level: template.aqf_level,
      structure: template.structure,
      default_sections: template.default_sections,
      gpt_prompts: template.gpt_prompts,
      is_active: template.is_active,
    });
    setShowTemplatesListModal(false); // Close templates list modal
    setShowTemplateFormModal(true); // Open template form modal
  };

  const handleDeleteTemplate = async (template: TASTemplate) => {
    if (template.is_system_template) {
      alert('❌ System templates cannot be deleted');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tenants/${params.tenantSlug}/tas/templates/${template.id}/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok || response.status === 204) {
        setTemplates(templates.filter(t => t.id !== template.id));
        alert('✅ Template deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete template:', errorData);
        alert(`❌ Failed to delete template: ${errorData.detail || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('❌ Error deleting template. Please try again.');
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    
    try {
      const url = templateFormMode === 'create'
        ? `${API_URL}/api/tenants/${params.tenantSlug}/tas/templates/`
        : `${API_URL}/api/tenants/${params.tenantSlug}/tas/templates/${selectedTemplate?.id}/`;
      
      const method = templateFormMode === 'create' ? 'POST' : 'PUT';
      
      console.log(`Saving template to: ${url}`, {
        method,
        templateForm,
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateForm),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const savedTemplate = await response.json();
        console.log('Template saved successfully:', savedTemplate);
        
        if (templateFormMode === 'create') {
          setTemplates([...templates, savedTemplate]);
          alert('✅ Template created successfully!');
        } else {
          setTemplates(templates.map(t => 
            t.id === selectedTemplate?.id ? savedTemplate : t
          ));
          alert('✅ Template updated successfully!');
        }
        
        setShowTemplateFormModal(false);
        setShowTemplatesListModal(true); // Return to templates list
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save template. Status:', response.status, 'Error:', errorData);
        
        // Show more detailed error message
        let errorMessage = 'Failed to save template';
        
        // Try to extract meaningful error information
        if (typeof errorData === 'object' && errorData !== null) {
          if (errorData.detail) {
            errorMessage += `: ${errorData.detail}`;
          } else if (errorData.error) {
            errorMessage += `: ${errorData.error}`;
          } else if (errorData.message) {
            errorMessage += `: ${errorData.message}`;
          } else if (Object.keys(errorData).length > 0) {
            // Try to show field-specific errors
            const errors = Object.entries(errorData)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                }
                return `${key}: ${String(value)}`;
              })
              .join('; ');
            errorMessage += `: ${errors}`;
          } else {
            errorMessage += `: ${response.statusText}`;
          }
        } else if (response.status === 404) {
          errorMessage += ': API endpoint not found. Make sure the backend server is running.';
        } else if (response.status === 500) {
          errorMessage += ': Server error. Check the backend logs.';
        } else {
          errorMessage += `: ${response.statusText}`;
        }
        
        alert(`❌ ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      
      // More specific error messages
      let errorMessage = 'Error saving template';
      if (error.message) {
        if (error.message.includes('fetch')) {
          errorMessage += ': Cannot connect to the backend server. Make sure it is running on ' + API_URL;
        } else {
          errorMessage += `: ${error.message}`;
        }
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setSavingTemplate(false);
    }
  };

  const TEMPLATE_TYPES = [
    { value: 'general', label: 'General Template' },
    { value: 'trade', label: 'Trade/Technical' },
    { value: 'business', label: 'Business/Commerce' },
    { value: 'health', label: 'Health/Community Services' },
    { value: 'creative', label: 'Creative Industries' },
    { value: 'hospitality', label: 'Hospitality/Tourism' },
    { value: 'technology', label: 'Information Technology' },
    { value: 'education', label: 'Education/Training' },
  ];

  const DEFAULT_SECTIONS = [
    'qualification_overview',
    'target_group',
    'entry_requirements',
    'learning_outcomes',
    'units_of_competency',
    'delivery_strategy',
    'assessment_strategy',
    'resources',
    'trainer_requirements',
    'aqf_alignment',
  ];

  const toggleSection = (section: string) => {
    const sections = templateForm.default_sections;
    if (sections.includes(section)) {
      setTemplateForm({
        ...templateForm,
        default_sections: sections.filter(s => s !== section),
      });
    } else {
      setTemplateForm({
        ...templateForm,
        default_sections: [...sections, section],
      });
    }
  };

  const loadVersions = async (doc: TAS) => {
    setVersions([]);
    setShowVersionModal(true);
    
    try {
      const response = await fetch(`${API_URL}/api/tenants/${params.tenantSlug}/tas/${doc.id}/versions/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Version history response:', data);
        
        // Handle both array and paginated response formats
        if (Array.isArray(data)) {
          setVersions(data);
        } else if (data.results && Array.isArray(data.results)) {
          setVersions(data.results);
        } else {
          console.error('Unexpected version history response format:', data);
        }
      } else {
        console.error('Failed to load version history:', response.status);
        alert('❌ Failed to load version history');
      }
    } catch (error) {
      console.error('Error loading version history:', error);
      alert('❌ Error loading version history');
    }
  };

  const loadLogs = async (doc: TAS) => {
    setLoadingLogs(true);
    setLogs([]);
    
    try {
      const response = await fetch(`${API_URL}/api/tenants/${params.tenantSlug}/tas/${doc.id}/generation_logs/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Generation logs response:', data);
        
        // Handle both array and paginated response formats
        if (Array.isArray(data)) {
          setLogs(data);
        } else if (data.results && Array.isArray(data.results)) {
          setLogs(data.results);
        } else {
          console.error('Unexpected logs response format:', data);
        }
      } else {
        console.error('Failed to load logs:', response.status);
        alert('Failed to load generation logs');
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      alert(`Error loading logs: ${error}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.status === activeTab;
  });

  const AQF_LEVELS = [
    { value: 'certificate_i', label: 'Certificate I' },
    { value: 'certificate_ii', label: 'Certificate II' },
    { value: 'certificate_iii', label: 'Certificate III' },
    { value: 'certificate_iv', label: 'Certificate IV' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'advanced_diploma', label: 'Advanced Diploma' },
    { value: 'graduate_certificate', label: 'Graduate Certificate' },
    { value: 'graduate_diploma', label: 'Graduate Diploma' },
    { value: 'bachelor', label: 'Bachelor Degree' },
    { value: 'masters', label: 'Masters Degree' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📄 TAS Generator</h1>
            <p className="text-gray-600">
              Auto TAS builder with GPT-4 synthesis • Version control • AQF alignment • 90% time reduction
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-semibold"
          >
            ✨ Generate New TAS
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-purple-600">90%</div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-blue-600">GPT-4</div>
            <div className="text-sm text-gray-600">AI Model</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-600">Templates</div>
            <button
              onClick={() => setShowTemplatesListModal(true)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'all', label: 'All Documents', count: documents.length },
            { key: 'draft', label: 'Drafts', count: documents.filter(d => d.status === 'draft').length },
            { key: 'approved', label: 'Approved', count: documents.filter(d => d.status === 'approved').length },
            { key: 'published', label: 'Published', count: documents.filter(d => d.status === 'published').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{doc.code}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[doc.status]}`}>
                    {doc.status_display}
                  </span>
                  {doc.gpt_generated && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      🤖 AI Generated
                    </span>
                  )}
                </div>
                <p className="text-gray-700 font-medium">{doc.qualification_name}</p>
                <p className="text-sm text-gray-500">{doc.aqf_level_display}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">v{doc.version}</div>
                <div className="text-xs text-gray-500">{doc.version_count} versions</div>
              </div>
            </div>

            {/* Time Saved Stats */}
            {doc.time_saved && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">⏱️ Time Saved</span>
                  <span className="text-lg font-bold text-purple-600">{doc.time_saved.saved_hours}h</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Traditional: {doc.time_saved.traditional_hours}h</span>
                  <span>•</span>
                  <span>GPT-4: {doc.time_saved.gpt_hours}h</span>
                  <span>•</span>
                  <span className="font-semibold text-purple-600">{doc.time_saved.percentage_saved}% reduction</span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-500">Training Package</div>
                <div className="font-medium text-gray-900">{doc.training_package || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500">GPT-4 Tokens</div>
                <div className="font-medium text-gray-900">{doc.gpt_tokens_used.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Created By</div>
                <div className="font-medium text-gray-900">
                  {doc.created_by_details 
                    ? `${doc.created_by_details.first_name} ${doc.created_by_details.last_name}` 
                    : 'System'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Last Updated</div>
                <div className="font-medium text-gray-900">{new Date(doc.updated_at).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  setShowPreviewModal(true);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                📄 View Document
              </button>
              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  loadVersions(doc);
                  setShowVersionModal(true);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                📋 Versions ({doc.version_count})
              </button>
              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  loadLogs(doc);
                  setShowLogsModal(true);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                📊 Logs
              </button>
              <button
                onClick={() => handleDeleteTAS(doc)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                title="Delete TAS document"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No TAS documents found</h3>
            <p className="text-gray-600 mb-4">Start by generating your first TAS document with GPT-4</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              ✨ Generate New TAS
            </button>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">✨ Generate New TAS with GPT-4</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📋 Template (Optional)
                </label>
                <select
                  value={generateForm.template_id || ''}
                  onChange={(e) => setGenerateForm({ ...generateForm, template_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No template (use defaults)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.aqf_level_display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification Selection from Training.gov.au */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎓</span>
                  <h3 className="text-lg font-semibold text-gray-900">Select Qualification from Training.gov.au</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search & Select Qualification *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={qualificationSearch}
                      onChange={(e) => setQualificationSearch(e.target.value)}
                      placeholder="Type to search qualifications (e.g., Business, IT, Hospitality)..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {loadingQualifications && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {qualificationSearch && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                      {qualifications
                        .filter(qual => 
                          qual.code.toLowerCase().includes(qualificationSearch.toLowerCase()) ||
                          qual.title.toLowerCase().includes(qualificationSearch.toLowerCase()) ||
                          qual.training_package.toLowerCase().includes(qualificationSearch.toLowerCase())
                        )
                        .map((qual) => (
                          <button
                            key={qual.code}
                            onClick={async () => {
                              console.log('🎓 Qualification selected:', qual.code, qual.title);
                              
                              setGenerateForm({
                                ...generateForm,
                                code: qual.code,
                                qualification_name: qual.title,
                                aqf_level: qual.aqf_level,
                                training_package: qual.training_package,
                              });
                              setQualificationSearch('');
                              
                              console.log('📚 About to load units...');
                              
                              // Load units for this qualification
                              await loadUnitsForQualification(qual.code);
                              
                              console.log('✅ Qualification selection complete');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-semibold text-gray-900">{qual.code}</div>
                            <div className="text-sm text-gray-700">{qual.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {qual.training_package} • {qual.aqf_level.replace('_', ' ').toUpperCase()}
                            </div>
                          </button>
                        ))}
                      {qualifications.filter(qual => 
                        qual.code.toLowerCase().includes(qualificationSearch.toLowerCase()) ||
                        qual.title.toLowerCase().includes(qualificationSearch.toLowerCase()) ||
                        qual.training_package.toLowerCase().includes(qualificationSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No qualifications found. Try a different search term.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {generateForm.code && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-semibold text-green-900">Selected Qualification:</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div><strong>Code:</strong> {generateForm.code}</div>
                      <div><strong>Title:</strong> {generateForm.qualification_name}</div>
                      <div><strong>Package:</strong> {generateForm.training_package}</div>
                      <div><strong>AQF Level:</strong> {generateForm.aqf_level.replace('_', ' ').toUpperCase()}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Units of Competency Selection */}
              {loadingUnits && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    <span className="text-gray-600">Loading units of competency...</span>
                  </div>
                </div>
              )}

              {unitsData && !loadingUnits && !unitsData.not_available && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📚</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Units of Competency</h3>
                      <p className="text-sm text-gray-600">{unitsData.packaging_rules}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-700">
                        {selectedUnits.length} units selected
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {unitsData.groupings.map((grouping: any, groupIdx: number) => (
                      <div key={groupIdx} className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                        {/* Grouping Header */}
                        <div className={`px-4 py-3 ${grouping.type === 'core' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{grouping.name}</h4>
                              {grouping.description && (
                                <p className="text-sm text-gray-600 mt-1">{grouping.description}</p>
                              )}
                              <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">Required:</span> {grouping.required} units
                                {grouping.type === 'core' && ' (All core units must be selected)'}
                              </p>
                            </div>
                            <button
                              onClick={() => selectAllInGrouping(grouping)}
                              className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium"
                            >
                              {grouping.units.every((u: any) => selectedUnits.includes(u.code)) ? '✓ Deselect All' : 'Select All'}
                            </button>
                          </div>
                        </div>

                        {/* Units List */}
                        <div className="divide-y divide-gray-200">
                          {grouping.units.map((unit: any, unitIdx: number) => (
                            <label
                              key={unitIdx}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUnits.includes(unit.code)}
                                onChange={() => toggleUnitSelection(unit.code)}
                                disabled={grouping.type === 'core'}
                                className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{unit.code}</div>
                                    <div className="text-sm text-gray-700 mt-1">{unit.title}</div>
                                  </div>
                                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                                    unit.type === 'core' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {unit.type}
                                  </span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {unitsData.has_groupings && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">💡</span>
                        <div className="text-sm text-gray-700">
                          <strong>Packaging Rules:</strong> This qualification has specialization options. 
                          {' '}Core units are pre-selected and required. Choose elective units based on your desired specialization or learning pathway.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Units not available message */}
              {unitsData && unitsData.not_available && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Units Data Not Available
                      </h3>
                      <p className="text-sm text-gray-700 mb-2">
                        Detailed units data for <strong>{generateForm.code}</strong> is not yet available in our system.
                      </p>
                      <p className="text-sm text-gray-600">
                        You can still generate the TAS document, and manually add units in the section below, or the system will use general qualification information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information - Now read-only/auto-populated */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualification Code *
                  </label>
                  <input
                    type="text"
                    value={generateForm.code}
                    readOnly
                    placeholder="Select from dropdown above"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AQF Level *
                  </label>
                  <input
                    type="text"
                    value={generateForm.aqf_level ? generateForm.aqf_level.replace('_', ' ').toUpperCase() : ''}
                    readOnly
                    placeholder="Auto-populated"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qualification Name *
                </label>
                <input
                  type="text"
                  value={generateForm.qualification_name}
                  readOnly
                  placeholder="Auto-populated from selection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Training Package (editable)
                  </label>
                  <input
                    type="text"
                    value={generateForm.training_package}
                    onChange={(e) => setGenerateForm({ ...generateForm, training_package: e.target.value })}
                    placeholder="Auto-populated, can override"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-populated from qualification, but you can override if needed</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Mode
                  </label>
                  <select
                    value={generateForm.delivery_mode}
                    onChange={(e) => setGenerateForm({ ...generateForm, delivery_mode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Face-to-face">Face-to-face</option>
                    <option value="Online">Online</option>
                    <option value="Blended">Blended</option>
                    <option value="Workplace">Workplace</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  value={generateForm.duration_weeks}
                  onChange={(e) => setGenerateForm({ ...generateForm, duration_weeks: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Units of Competency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Units of Competency
                  </label>
                  <button
                    onClick={addUnit}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    + Add Unit
                  </button>
                </div>
                <div className="space-y-2">
                  {generateForm.units_of_competency.map((unit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={unit.code}
                        onChange={(e) => updateUnit(index, 'code', e.target.value)}
                        placeholder="Unit Code"
                        className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => updateUnit(index, 'title', e.target.value)}
                        placeholder="Unit Title"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeUnit(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Context for GPT-4
                </label>
                <textarea
                  value={generateForm.additional_context}
                  onChange={(e) => setGenerateForm({ ...generateForm, additional_context: e.target.value })}
                  placeholder="Provide any additional context or specific requirements for the TAS generation..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* AI Model Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🤖 AI Model Selection
                </label>
                <select
                  value={generateForm.ai_model}
                  onChange={(e) => setGenerateForm({ ...generateForm, ai_model: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!generateForm.use_gpt4}
                >
                  <optgroup label="GPT-4 Models (Recommended)">
                    <option value="gpt-4o">GPT-4o (Latest, Fast & Intelligent)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost-Effective)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (128K context)</option>
                    <option value="gpt-4">GPT-4 (Classic)</option>
                  </optgroup>
                  <optgroup label="GPT-3.5 Models">
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Economical)</option>
                  </optgroup>
                  <optgroup label="O1 Models (Advanced Reasoning)">
                    <option value="o1-preview">O1 Preview (Advanced reasoning)</option>
                    <option value="o1-mini">O1 Mini (Fast reasoning)</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {generateForm.ai_model === 'gpt-4o' && '🌟 Best for comprehensive TAS generation with fast responses'}
                  {generateForm.ai_model === 'gpt-4o-mini' && '⚡ Optimized for speed while maintaining quality'}
                  {generateForm.ai_model === 'gpt-4-turbo' && '📚 Large context window ideal for complex qualifications'}
                  {generateForm.ai_model === 'gpt-4' && '🏆 Classic GPT-4 model with proven reliability'}
                  {generateForm.ai_model === 'gpt-3.5-turbo' && '💨 Fastest and most economical option'}
                  {generateForm.ai_model === 'o1-preview' && '🧠 Advanced reasoning for complex educational frameworks'}
                  {generateForm.ai_model === 'o1-mini' && '🎯 Focused reasoning capabilities'}
                </p>
              </div>

              {/* GPT-4 Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="use-gpt4"
                  checked={generateForm.use_gpt4}
                  onChange={(e) => setGenerateForm({ ...generateForm, use_gpt4: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="use-gpt4" className="text-sm font-medium text-gray-700">
                  🤖 Use AI for content generation (90% time reduction)
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !generateForm.code || !generateForm.qualification_name}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {generating 
                  ? `⚡ Generating with ${generateForm.ai_model.toUpperCase()}...` 
                  : generateForm.use_gpt4 
                    ? `✨ Generate TAS with ${generateForm.ai_model.toUpperCase()}` 
                    : '✨ Generate TAS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📋 Version History - {selectedDocument.code}</h2>
              <button onClick={() => setShowVersionModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-lg font-bold text-gray-900">Version {version.version_number}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(version.created_at).toLocaleString()} by {version.created_by_details.first_name} {version.created_by_details.last_name}
                        </div>
                      </div>
                      {version.was_regenerated && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          🤖 Regenerated
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <div className="text-sm font-semibold text-gray-700 mb-1">Change Summary:</div>
                      <div className="text-sm text-gray-600">{version.change_summary}</div>
                    </div>
                    {version.changed_sections.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">Changed Sections:</div>
                        <div className="flex flex-wrap gap-2">
                          {version.changed_sections.map((section, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {section.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📄 {selectedDocument.code} - {selectedDocument.qualification_name}</h2>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-6">{selectedDocument.description || 'Training and Assessment Strategy document'}</p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <h4 className="font-bold text-blue-900 mb-2">📊 Document Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>AQF Level:</strong> {selectedDocument.aqf_level_display}</div>
                    <div><strong>Training Package:</strong> {selectedDocument.training_package || 'N/A'}</div>
                    <div><strong>Version:</strong> {selectedDocument.version}</div>
                    <div><strong>Status:</strong> {selectedDocument.status_display}</div>
                  </div>
                </div>

                {selectedDocument.gpt_generated && selectedDocument.time_saved && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                    <h4 className="font-bold text-purple-900 mb-2">🤖 GPT-4 Generation Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Time Saved</div>
                        <div className="font-bold text-purple-600">{selectedDocument.time_saved.saved_hours}h</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tokens Used</div>
                        <div className="font-bold">{selectedDocument.gpt_tokens_used.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Reduction</div>
                        <div className="font-bold text-green-600">{selectedDocument.time_saved.percentage_saved}%</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <p>Document content sections would be displayed here</p>
                  <p className="text-sm">Including: Qualification Overview, Learning Outcomes, Assessment Strategy, etc.</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                📥 Export PDF
              </button>
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                📝 Edit Document
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                🔄 Regenerate Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List Modal */}
      {showTemplatesListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📋 TAS Templates</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  ➕ Create Template
                </button>
                <button onClick={() => setShowTemplatesListModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingTemplates ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">Loading templates...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {template.template_type_display}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {template.aqf_level_display}
                          </span>
                          {template.is_system_template && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              🔒 System
                            </span>
                          )}
                          {!template.is_active && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Default Sections ({template.default_sections.length}):</div>
                      <div className="flex flex-wrap gap-1">
                        {template.default_sections.slice(0, 5).map((section, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {section.replace('_', ' ')}
                          </span>
                        ))}
                        {template.default_sections.length > 5 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{template.default_sections.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Created by {template.created_by_details 
                        ? `${template.created_by_details.first_name} ${template.created_by_details.last_name}`
                        : 'System'} • 
                      Updated {new Date(template.updated_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setGenerateForm({ ...generateForm, template_id: template.id });
                          setShowTemplatesListModal(false);
                          setShowGenerateModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        ✨ Use Template
                      </button>
                      <button
                        onClick={() => {
                          handleEditTemplate(template);
                          setShowTemplatesListModal(false);
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      {!template.is_system_template && (
                        <button
                          onClick={() => handleDeleteTemplate(template)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {templates.length === 0 && !loadingTemplates && (
                  <div className="col-span-2 text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-600 mb-4">Create your first template to streamline TAS generation</p>
                    <button
                      onClick={handleCreateTemplate}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      ➕ Create Template
                    </button>
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Form Modal (Create/Edit) */}
      {showTemplateFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {templateFormMode === 'create' ? '➕ Create New Template' : '✏️ Edit Template'}
              </h2>
              <button onClick={() => setShowTemplateFormModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g., Standard Diploma Template"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Describe the purpose and use case for this template..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <select
                    value={templateForm.template_type}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AQF Level *
                  </label>
                  <select
                    value={templateForm.aqf_level}
                    onChange={(e) => setTemplateForm({ ...templateForm, aqf_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {AQF_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Sections */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Sections to Include
                </label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {DEFAULT_SECTIONS.map((section) => (
                    <label key={section} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={templateForm.default_sections.includes(section)}
                        onChange={() => toggleSection(section)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Selected: {templateForm.default_sections.length} of {DEFAULT_SECTIONS.length} sections
                </div>
              </div>

              {/* GPT Prompts */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom GPT-4 Prompts (Optional)
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Define custom prompts for specific sections to guide GPT-4 generation. Leave blank to use defaults.
                  </p>
                  <div className="space-y-3">
                    {templateForm.default_sections.slice(0, 3).map((section) => (
                      <div key={section}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <textarea
                          value={templateForm.gpt_prompts[section] || ''}
                          onChange={(e) => setTemplateForm({
                            ...templateForm,
                            gpt_prompts: { ...templateForm.gpt_prompts, [section]: e.target.value }
                          })}
                          placeholder={`Custom prompt for ${section.replace(/_/g, ' ')}...`}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                    {templateForm.default_sections.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        + {templateForm.default_sections.length - 3} more sections (expand to customize all prompts)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="template-active"
                  checked={templateForm.is_active}
                  onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="template-active" className="text-sm font-medium text-gray-700">
                  ✅ Template is active and available for use
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowTemplateFormModal(false);
                  // Optionally return to templates list if user was browsing templates
                  // setShowTemplatesListModal(true);
                }}
                disabled={savingTemplate}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={savingTemplate || !templateForm.name || !templateForm.description}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {savingTemplate 
                  ? '💾 Saving...' 
                  : templateFormMode === 'create' 
                    ? '➕ Create Template' 
                    : '💾 Save Changes'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📄 {selectedDocument.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      {selectedDocument.aqf_level_display}
                    </span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      Version {selectedDocument.version}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${
                      selectedDocument.status === 'approved' ? 'bg-green-500' :
                      selectedDocument.status === 'published' ? 'bg-blue-500' :
                      selectedDocument.status === 'in_review' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}>
                      {selectedDocument.status_display}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  // TODO: Implement PDF export
                  alert('📄 PDF Export functionality will be implemented here.\n\nThis will generate a formatted PDF of the TAS document.');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => handleEditDocument(selectedDocument)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ✏️ Edit Document
              </button>
              <button
                onClick={() => {
                  // TODO: Implement regenerate section
                  alert('🔄 Regenerate Section functionality will be implemented here.\n\nThis will use AI to regenerate specific sections of the TAS document.');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🔄 Regenerate Section
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Document Metadata */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Code:</span>
                    <span className="ml-2 text-blue-900">{selectedDocument.code}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Qualification:</span>
                    <span className="ml-2 text-blue-900">{selectedDocument.qualification_name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Training Package:</span>
                    <span className="ml-2 text-blue-900">{selectedDocument.training_package || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">AQF Level:</span>
                    <span className="ml-2 text-blue-900">{selectedDocument.aqf_level_display}</span>
                  </div>
                  {selectedDocument.gpt_generated && (
                    <>
                      <div>
                        <span className="text-blue-700 font-medium">AI Model:</span>
                        <span className="ml-2 text-blue-900">{selectedDocument.gpt_model_used}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Generation Time:</span>
                        <span className="ml-2 text-blue-900">{selectedDocument.generation_time_seconds.toFixed(2)}s</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Document Sections */}
              {selectedDocument.sections && selectedDocument.sections.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Document Sections</h3>
                  {selectedDocument.sections.map((section: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {section.title || section.name}
                        </h4>
                        <button
                          onClick={async () => {
                            if (!confirm(`Regenerate "${section.title || section.name}" section?`)) return;
                            
                            try {
                              const response = await fetch(
                                `${API_URL}/api/tenants/${params.tenantSlug}/tas/${selectedDocument.id}/regenerate_section/`,
                                {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    section_name: section.name,
                                    ai_model: 'gpt-4o',
                                  }),
                                }
                              );

                              if (!response.ok) {
                                const error = await response.json();
                                throw new Error(error.message || 'Failed to regenerate section');
                              }

                              const result = await response.json();
                              alert(result.message || 'Section regenerated successfully!');
                              
                              // Fetch the updated document directly from the API
                              const docResponse = await fetch(
                                `${API_URL}/api/tenants/${params.tenantSlug}/tas/${selectedDocument.id}/`,
                                {
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                }
                              );
                              
                              if (docResponse.ok) {
                                const updatedDoc = await docResponse.json();
                                console.log('✅ Document refreshed after regeneration:', updatedDoc.sections?.length || 0, 'sections');
                                setSelectedDocument(updatedDoc);
                              }
                              
                              // Refresh the document list for the grid view
                              await loadTASDocuments();
                            } catch (error: any) {
                              console.error('❌ Regeneration error:', error);
                              alert(`Error: ${error.message}`);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          title="Regenerate this section"
                        >
                          <span>🔄</span>
                          <span>Regenerate</span>
                        </button>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                      {section.generated_by && (
                        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                          Generated by {section.generated_by} • {section.tokens} tokens
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Content Yet</h3>
                  <p className="text-gray-600">
                    This TAS document doesn't have any sections yet.
                    {selectedDocument.gpt_generated && ' Content generation may have been skipped.'}
                  </p>
                </div>
              )}

              {/* Description */}
              {selectedDocument.description && (
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedDocument.description}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  loadVersions(selectedDocument);
                  setShowVersionModal(true);
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                📋 View Versions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Logs Modal */}
      {showLogsModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📊 Generation Logs</h2>
                  <p className="text-blue-100 mt-1">{selectedDocument.title}</p>
                </div>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingLogs ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⏳</div>
                  <p className="text-gray-600">Loading generation logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No logs found</h3>
                  <p className="text-gray-600">This TAS document has no generation logs yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      {/* Log Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              log.status === 'completed' ? 'bg-green-100 text-green-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              log.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.status_display || log.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              Log #{log.id}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(log.created_at).toLocaleString()}
                          </p>
                          {log.completed_at && (
                            <p className="text-sm text-gray-500">
                              Completed: {new Date(log.completed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Log Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">AI Model</div>
                          <div className="font-semibold text-gray-900">{log.model_version}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">Generation Time</div>
                          <div className="font-semibold text-gray-900">
                            {log.generation_time_seconds.toFixed(2)}s
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">Total Tokens</div>
                          <div className="font-semibold text-gray-900">
                            {log.tokens_total.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">Status</div>
                          <div className="font-semibold text-gray-900">{log.status_display}</div>
                        </div>
                      </div>

                      {/* Error Message */}
                      {log.error_message && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                          <div className="flex items-start gap-2">
                            <span className="text-red-600 text-xl">⚠️</span>
                            <div className="flex-1">
                              <div className="font-semibold text-red-800 mb-1">Error</div>
                              <div className="text-sm text-red-700">{log.error_message}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowLogsModal(false)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-5 rounded-t-lg">
              <h2 className="text-2xl font-bold">Version History</h2>
              <p className="text-purple-100 mt-1">Track changes and regenerations over time</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {versions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No version history</h3>
                  <p className="text-gray-600">This TAS document has no previous versions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version, index) => (
                    <div key={version.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      {/* Version Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              index === 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {index === 0 ? '✓ Current Version' : `Version ${version.version_number}`}
                            </span>
                            <span className="text-sm text-gray-600">
                              v{version.version_number}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(version.created_at).toLocaleString()}
                          </p>
                        </div>
                        {index !== 0 && (
                          <button
                            onClick={() => {
                              alert('🔄 Restore Version\n\nThis will restore the TAS document to this version.\n\n(Feature coming soon)');
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                          >
                            Restore This Version
                          </button>
                        )}
                      </div>

                      {/* Change Summary */}
                      {version.change_summary && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                          <div className="text-sm text-gray-500 mb-1">Change Summary</div>
                          <div className="text-gray-900">{version.change_summary}</div>
                        </div>
                      )}

                      {/* Version Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {version.was_regenerated && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Regenerated</div>
                            <div className="font-semibold text-purple-600">✓ Yes</div>
                          </div>
                        )}
                        {version.regeneration_reason && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Reason</div>
                            <div className="text-sm text-gray-900">{version.regeneration_reason}</div>
                          </div>
                        )}
                        {version.created_by_details && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Created By</div>
                            <div className="font-semibold text-gray-900">
                              {version.created_by_details.first_name} {version.created_by_details.last_name}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Changed Sections */}
                      {version.changed_sections && version.changed_sections.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-sm text-blue-800 font-semibold mb-2">
                            Modified Sections ({version.changed_sections.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {version.changed_sections.map((section, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                              >
                                {section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowVersionModal(false)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5 rounded-t-lg">
              <h2 className="text-2xl font-bold">Edit TAS Document</h2>
              <p className="text-blue-100 mt-1">Make changes to your TAS document content</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Title *
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter document title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter document description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qualification Name *
                        </label>
                        <input
                          type="text"
                          value={editForm.qualification_name}
                          onChange={(e) => setEditForm({ ...editForm, qualification_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Certificate IV in IT"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Training Package
                        </label>
                        <input
                          type="text"
                          value={editForm.training_package}
                          onChange={(e) => setEditForm({ ...editForm, training_package: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., ICT"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="in_review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Units of Competency Table */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Units of Competency</h3>
                  
                  {editForm.units_of_competency.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-gray-600">No units of competency defined</p>
                      <p className="text-sm text-gray-500 mt-1">Units will appear here once the TAS is generated with unit information</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                              #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                              Unit Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                              Unit Title
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {editForm.units_of_competency.map((unit: { code: string; title: string }, index: number) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {unit.code}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {unit.title}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Total Units:</span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          {editForm.units_of_competency.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sections Editor */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Document Sections</h3>
                  
                  {editForm.sections.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-600">No sections available to edit</p>
                      <p className="text-sm text-gray-500 mt-1">Sections will appear here once generated</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {editForm.sections.map((section: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {section.title || section.name || `Section ${index + 1}`}
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {section.tokens || 0} tokens
                              </span>
                              <button
                                onClick={() => {
                                  const preview = window.open('', '_blank');
                                  if (preview) {
                                    preview.document.write(`
                                      <!DOCTYPE html>
                                      <html>
                                        <head>
                                          <title>${section.title || 'Section'} Preview</title>
                                          <style>
                                            body {
                                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                                                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                                              padding: 40px;
                                              max-width: 800px;
                                              margin: 0 auto;
                                              line-height: 1.6;
                                              color: #333;
                                            }
                                            h1, h2, h3, h4, h5, h6 {
                                              margin-top: 1.5em;
                                              margin-bottom: 0.5em;
                                              color: #111;
                                            }
                                            p {
                                              margin-bottom: 1em;
                                            }
                                            ul, ol {
                                              margin-bottom: 1em;
                                              padding-left: 2em;
                                            }
                                            blockquote {
                                              border-left: 4px solid #ddd;
                                              padding-left: 1em;
                                              margin: 1em 0;
                                              color: #666;
                                            }
                                            code {
                                              background: #f4f4f4;
                                              padding: 2px 6px;
                                              border-radius: 3px;
                                              font-family: 'Courier New', monospace;
                                            }
                                            pre {
                                              background: #f4f4f4;
                                              padding: 1em;
                                              border-radius: 4px;
                                              overflow-x: auto;
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          <h1>${section.title || 'Section Preview'}</h1>
                                          ${section.content || '<p>No content</p>'}
                                        </body>
                                      </html>
                                    `);
                                    preview.document.close();
                                  }
                                }}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                              >
                                <span>👁️</span>
                                <span className="font-medium">Preview</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <RichTextEditor
                              value={section.content || ''}
                              onChange={(content) => updateSectionContent(index, content)}
                              placeholder="Enter section content with rich formatting..."
                              height="300px"
                            />
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
                            <span className="flex items-center gap-2">
                              <span>💡</span>
                              <span>Use the toolbar above for rich text formatting (bold, italic, lists, headings, etc.)</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Version Control */}
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Version Control</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="create-version"
                        checked={editForm.create_version}
                        onChange={(e) => setEditForm({ ...editForm, create_version: e.target.checked })}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="create-version" className="font-medium text-gray-900 cursor-pointer">
                          Create New Version
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Creates a new version instead of overwriting the current one. Recommended for major changes.
                        </p>
                      </div>
                    </div>

                    {editForm.create_version && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Change Summary * <span className="text-red-500">(Required for new version)</span>
                        </label>
                        <textarea
                          value={editForm.change_summary}
                          onChange={(e) => setEditForm({ ...editForm, change_summary: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe what changes you made (e.g., 'Updated assessment strategy section')"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDocument(null);
                }}
                disabled={savingEdit}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editForm.title || !editForm.qualification_name}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {savingEdit ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    {editForm.create_version ? 'Create New Version' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
