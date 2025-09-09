import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { apiService } from '@/services/api';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText,
  Video,
  Link,
  Plus,
  Bot,
  Sparkles,
  Brain,
  CheckCircle,
  Loader2
} from 'lucide-react';

const mockMaterials = [
  {
    id: 1,
    title: "Introduction to Calculus",
    type: "PDF",
    classroom: "Mathematics",
    uploadDate: "2024-01-15",
    size: "2.4 MB",
    
    description: "Comprehensive guide covering basic calculus concepts and derivatives"
  },
  {
    id: 2,
    title: "Physics Fundamentals",
    type: "Video",
    classroom: "Physics",
    uploadDate: "2024-01-14",
    size: "45 MB",
    description: "Video lecture on Newton's laws and motion principles"
  },
  {
    id: 3,
    title: "Chemistry Lab Guidelines",
    type: "PDF",
    classroom: "Chemistry",
    uploadDate: "2024-01-13",
    size: "1.8 MB",
    description: "Safety protocols and experiment procedures for laboratory work"
  },
  {
    id: 4,
    title: "History Timeline",
    type: "Link",
    classroom: "History",
    uploadDate: "2024-01-12",
    size: "-",
    description: "Interactive timeline of major historical events"
  }
];

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'video':
      return <Video className="h-5 w-5 text-blue-500" />;
    case 'link':
      return <Link className="h-5 w-5 text-green-500" />;
    default:
      return <BookOpen className="h-5 w-5 text-gray-500" />;
  }
};

const Materials: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploaderFilter, setUploaderFilter] = useState('All');
  const [downloading, setDownloading] = useState<number | null>(null);

  const allMaterials = [...mockMaterials.map(m => ({...m, uploadedBy: 'teacher'})), ...uploadedFiles.map(m => ({...m, uploadedBy: 'student'}))];
  const filteredMaterials = allMaterials.filter(material => {
    const matchesSubject = selectedFilter === 'All' || material.type === selectedFilter;
    const matchesUploader = uploaderFilter === 'All' || material.uploadedBy === uploaderFilter;
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesUploader && matchesSearch;
  });

  const handleDownload = async (material: any) => {
    setDownloading(material.id);
    try {
      if (material.uploadedBy === 'teacher') {
        // For teacher materials, try API download first, fallback to mock content
        try {
          const response = await apiService.downloadMaterialFile(material.id.toString());
          if (response.success && response.data) {
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${material.title}.${material.type.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Track download activity
            await apiService.viewMaterial(material.id.toString());
          } else {
            throw new Error('API download failed');
          }
        } catch (apiError) {
          console.warn('API download failed, using fallback content:', apiError);
          // Fallback to mock content for teacher materials
          const mockContent = generateMockContent(material);
          const blob = new Blob([mockContent], { 
            type: material.type === 'PDF' ? 'application/pdf' : 
                  material.type === 'Video' ? 'video/mp4' : 
                  'text/plain' 
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${material.title}.${material.type.toLowerCase()}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // For student uploaded files, use mock content
        const mockContent = generateMockContent(material);
        const blob = new Blob([mockContent], { 
          type: material.type === 'PDF' ? 'application/pdf' : 
                material.type === 'Video' ? 'video/mp4' : 
                'text/plain' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${material.title}.${material.type.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      alert(`📥 ${material.title} downloaded successfully!`);
    } catch (error) {
      alert(`❌ Failed to download ${material.title}. Please try again.`);
      console.error('Download error:', error);
    } finally {
      setDownloading(null);
    }
  };

  const generateMockContent = (material: any) => {
    const materialDetails: { [key: number]: { content: string; exercises: string[] } } = {
      1: {
        content: `# ${material.title}\n\n## Comprehensive Study Guide\n\nThis is a detailed study material for ${material.title} in ${material.classroom}.\n\n### Key Topics:\n- Fundamental concepts and principles\n- Practical applications and examples\n- Step-by-step problem-solving methods\n- Important formulas and equations\n\n### Learning Objectives:\nBy the end of this material, you should be able to:\n1. Understand core concepts\n2. Apply knowledge to solve problems\n3. Analyze complex scenarios\n4. Synthesize information effectively\n\n### Content Overview:\nThis ${material.type} contains comprehensive information covering all essential aspects of the topic. The material is structured to provide both theoretical understanding and practical application.\n\n### Additional Resources:\n- Practice exercises with solutions\n- Reference materials and further reading\n- Interactive examples and case studies\n\nFor any questions or clarifications, please contact your instructor.\n\n---\nGenerated on: ${new Date().toLocaleDateString()}\nMaterial ID: ${material.id}\nSubject: ${material.classroom}`,
        exercises: [
          "Complete the practice problems at the end of each chapter",
          "Review key concepts and create summary notes",
          "Apply learned principles to real-world scenarios",
          "Prepare for upcoming assessments and discussions"
        ]
      }
    };
    
    const details = materialDetails[1]; // Use default template
    return `${details.content}\n\n## Practice Exercises:\n${details.exercises.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`;
  };

  const handleUpload = () => {
    // Simulate file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        const newFiles = files.map((file: any, index) => ({
          id: Date.now() + index,
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          classroom: 'General',
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          description: `Uploaded file: ${file.name}`,
          isUploaded: true
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        alert(`${files.length} file(s) uploaded successfully! You can now generate summaries for them.`);
      }
    };
    input.click();
  };

  const handleMaterialSelect = (materialId: number) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId) 
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleGenerateSummary = async () => {
    if (selectedMaterials.length === 0) {
      alert('Please select at least one material to generate a summary.');
      return;
    }

    setIsGeneratingSummary(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const allMaterials = [...mockMaterials, ...uploadedFiles];
      const selectedItems = allMaterials.filter(m => selectedMaterials.includes(m.id));
      
      const summary = `# AI-Generated Summary\n\n## Materials Analyzed:\n${selectedItems.map(m => `• ${m.title} (${m.classroom})`).join('\n')}\n\n## Key Insights:\n\n### Main Concepts:\n• **Fundamental Principles**: Core concepts covered across selected materials\n• **Practical Applications**: Real-world applications and examples\n• **Mathematical Foundations**: Key formulas and theoretical frameworks\n\n### Learning Objectives:\n1. **Understanding**: Grasp fundamental concepts and principles\n2. **Application**: Apply knowledge to solve problems\n3. **Analysis**: Analyze complex scenarios using learned concepts\n\n### Study Recommendations:\n• Focus on understanding core principles before moving to advanced topics\n• Practice with examples and exercises regularly\n• Connect theoretical knowledge with practical applications\n• Review prerequisite concepts if needed\n\n### Important Topics to Master:\n${selectedItems.map(m => `• ${m.title}: ${m.description}`).join('\n')}\n\n*This summary was generated using advanced AI analysis similar to NotebookLM, providing key insights and learning pathways from your selected materials.*`;
      
      setGeneratedSummary(summary);
      setIsGeneratingSummary(false);
      setSummaryDialogOpen(true);
    }, 3000);
  };

  const handleViewMaterial = (material: any) => {
    const materialDetails = {
      1: {
        content: "# Introduction to Calculus\n\n## Chapter 1: Limits and Continuity\n\n### 1.1 Understanding Limits\nA limit describes the behavior of a function as it approaches a particular point. The formal definition:\n\n**Definition**: lim(x→a) f(x) = L\n\n### Key Concepts:\n• **One-sided limits**: Left and right limits\n• **Infinite limits**: When functions approach infinity\n• **Limits at infinity**: Behavior as x approaches ±∞\n\n### 1.2 Continuity\nA function is continuous at point a if:\n1. f(a) is defined\n2. lim(x→a) f(x) exists\n3. lim(x→a) f(x) = f(a)\n\n## Chapter 2: Derivatives\n\n### 2.1 Definition of Derivative\nf'(x) = lim(h→0) [f(x+h) - f(x)]/h\n\n### Common Derivatives:\n• d/dx(x^n) = nx^(n-1) (Power Rule)\n• d/dx(sin x) = cos x\n• d/dx(cos x) = -sin x\n• d/dx(e^x) = e^x\n• d/dx(ln x) = 1/x\n\n### 2.2 Applications\n• **Rate of change**: Velocity, acceleration\n• **Optimization**: Finding maximum and minimum values\n• **Related rates**: How quantities change with respect to each other",
        exercises: [
          "Find lim(x→2) (x² - 4)/(x - 2)",
          "Determine if f(x) = |x| is continuous at x = 0",
          "Find the derivative of f(x) = 3x² + 2x - 1",
          "Use the product rule to find d/dx[x²sin(x)]"
        ]
      },
      2: {
        content: "# Physics Fundamentals\n\n## Newton's Laws of Motion\n\n### First Law (Law of Inertia)\nAn object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an unbalanced force.\n\n**Mathematical Expression**: ΣF = 0 ⟹ v = constant\n\n### Second Law\nThe acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.\n\n**Formula**: F = ma\n\nWhere:\n• F = Net force (Newtons)\n• m = Mass (kg)\n• a = Acceleration (m/s²)\n\n### Third Law\nFor every action, there is an equal and opposite reaction.\n\n**Mathematical Expression**: F₁₂ = -F₂₁\n\n## Motion Equations\n\n### Kinematic Equations:\n1. v = u + at\n2. s = ut + ½at²\n3. v² = u² + 2as\n4. s = (u + v)t/2\n\n### Variables:\n• u = Initial velocity\n• v = Final velocity\n• a = Acceleration\n• t = Time\n• s = Displacement\n\n## Energy and Work\n\n### Work-Energy Theorem\nW = ΔKE = ½mv² - ½mu²\n\n### Conservation of Energy\nTotal mechanical energy = KE + PE = constant",
        exercises: [
          "A 5kg object accelerates at 2m/s². What force is applied?",
          "Calculate final velocity: u=10m/s, a=3m/s², t=4s",
          "Find the work done lifting a 20kg object 5m high",
          "Explain why a ball thrown upward eventually falls down"
        ]
      },
      3: {
        content: "# Chemistry Lab Guidelines\n\n## Safety Protocols\n\n### Personal Protective Equipment (PPE)\n• **Safety goggles**: Must be worn at all times\n• **Lab coats**: Protect clothing and skin\n• **Gloves**: Use appropriate type for chemicals\n• **Closed-toe shoes**: No sandals or open shoes\n\n### Chemical Handling\n\n#### General Rules:\n1. Read all labels before use\n2. Never mix chemicals unless instructed\n3. Use fume hood for volatile substances\n4. Measure accurately using proper equipment\n\n#### Acid Safety:\n• Always add acid to water, never water to acid\n• Use glass or plastic containers only\n• Have neutralizing agents nearby\n• Work in well-ventilated areas\n\n## Laboratory Techniques\n\n### Measurement and Precision\n• **Graduated cylinders**: ±0.1 mL accuracy\n• **Burettes**: ±0.05 mL accuracy\n• **Analytical balance**: ±0.0001 g accuracy\n• **Pipettes**: Most accurate for fixed volumes\n\n### Common Procedures\n\n#### Titration:\n1. Rinse burette with titrant\n2. Fill burette and record initial reading\n3. Add indicator to analyte\n4. Titrate slowly near endpoint\n5. Record final reading\n\n#### Crystallization:\n1. Dissolve sample in minimum hot solvent\n2. Filter hot solution if needed\n3. Cool slowly for large crystals\n4. Filter and wash crystals\n5. Dry in oven or desiccator\n\n## Emergency Procedures\n\n### Fire:\n• Alert others immediately\n• Use appropriate fire extinguisher\n• Evacuate if necessary\n\n### Chemical Spills:\n• Contain spill immediately\n• Use spill kit materials\n• Ventilate area\n• Report to instructor",
        exercises: [
          "Calculate molarity of 2.5g NaCl in 250mL solution",
          "What PPE is required for handling concentrated HCl?",
          "Describe the proper titration technique",
          "List steps for emergency chemical spill cleanup"
        ]
      },
      4: {
        content: "# History Timeline: Major World Events\n\n## Ancient Civilizations (3500 BCE - 500 CE)\n\n### Mesopotamia (3500-539 BCE)\n• **3500 BCE**: First cities in Sumer\n• **2334 BCE**: Sargon creates first empire\n• **1792 BCE**: Hammurabi's Code established\n• **605 BCE**: Nebuchadnezzar II builds Hanging Gardens\n\n### Ancient Egypt (3100-30 BCE)\n• **3100 BCE**: Unification under Pharaoh Menes\n• **2580 BCE**: Great Pyramid of Giza built\n• **1353 BCE**: Akhenaten's religious revolution\n• **30 BCE**: Roman conquest under Augustus\n\n### Classical Greece (800-146 BCE)\n• **776 BCE**: First Olympic Games\n• **508 BCE**: Democracy established in Athens\n• **490-479 BCE**: Persian Wars\n• **431-404 BCE**: Peloponnesian War\n• **336-323 BCE**: Alexander the Great's conquests\n\n### Roman Empire (27 BCE - 476 CE)\n• **27 BCE**: Augustus becomes first emperor\n• **64 CE**: Great Fire of Rome\n• **313 CE**: Constantine legalizes Christianity\n• **476 CE**: Fall of Western Roman Empire\n\n## Medieval Period (500-1500 CE)\n\n### Byzantine Empire (330-1453 CE)\n• **330 CE**: Constantinople founded\n• **726-843 CE**: Iconoclastic period\n• **1054 CE**: Great Schism with Rome\n• **1453 CE**: Ottoman conquest\n\n### Islamic Golden Age (8th-13th centuries)\n• **622 CE**: Hijra - Islamic calendar begins\n• **732 CE**: Battle of Tours\n• **786 CE**: Harun al-Rashid's reign\n• **1258 CE**: Mongols destroy Baghdad\n\n### Medieval Europe\n• **800 CE**: Charlemagne crowned emperor\n• **1066 CE**: Norman Conquest of England\n• **1095-1291 CE**: The Crusades\n• **1347-1351 CE**: Black Death pandemic\n\n## Renaissance and Exploration (1400-1600)\n\n### Key Events:\n• **1453**: Fall of Constantinople\n• **1492**: Columbus reaches Americas\n• **1517**: Martin Luther's 95 Theses\n• **1588**: Spanish Armada defeated",
        exercises: [
          "Compare democracy in Athens vs modern democracy",
          "Analyze causes of the Roman Empire's fall",
          "Explain the impact of the Black Death on Europe",
          "Discuss the significance of the Renaissance"
        ]
      }
    };
    
    const details = materialDetails[material.id as keyof typeof materialDetails];
    if (details) {
      const detailsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (detailsWindow) {
        detailsWindow.document.write(`
          <html>
            <head>
              <title>${material.title} - Details</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; margin: 40px; background: #f8fafc; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
                h2 { color: #334155; margin-top: 30px; }
                h3 { color: #475569; }
                code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; }
                .exercise { background: #eff6ff; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
                .exercise h4 { margin: 0 0 10px 0; color: #1e40af; }
                ul { padding-left: 20px; }
                li { margin: 5px 0; }
                .formula { background: #fef3c7; padding: 10px; border-radius: 6px; font-family: 'Courier New', monospace; text-align: center; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${material.title}</h1>
                <p><strong>Subject:</strong> ${material.classroom} | <strong>Type:</strong> ${material.type} | <strong>Size:</strong> ${material.size}</p>
                <div>${details.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</div>
                <div class="exercise">
                  <h4>Practice Exercises:</h4>
                  <ol>
                    ${details.exercises.map(ex => `<li>${ex}</li>`).join('')}
                  </ol>
                </div>
              </div>
            </body>
          </html>
        `);
        detailsWindow.document.close();
      }
    } else {
      alert('Material details not available yet. This feature is being developed!');
    }
  };

  const handleChatWithMaterial = (material: any) => {
    // Navigate to chatbot with material context
    navigate('/chatbot', { 
      state: { 
        materialContext: {
          title: material.title,
          subject: material.classroom,
          description: material.description,
          type: material.type
        }
      }
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-2 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Learning Materials</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Access and manage your study resources</p>
        </div>
        
        <Button className="bg-gradient-primary" onClick={handleUpload}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm lg:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'PDF', 'Video', 'Link'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className="whitespace-nowrap text-xs lg:text-sm"
            >
              <Filter className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Uploader Filter */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Filter by Uploader</h3>
          <div className="flex gap-2 overflow-x-auto">
            {['All', 'teacher', 'student'].map((filter) => (
              <Button
                key={filter}
                variant={uploaderFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploaderFilter(filter)}
                className="whitespace-nowrap text-xs lg:text-sm capitalize"
              >
                {filter === 'teacher' ? '👨‍🏫 Teacher Materials' : 
                 filter === 'student' ? '👨‍🎓 Student Uploads' : 
                 '📚 All Materials'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className={`shadow-card hover:shadow-elevated transition-all ${
            selectedMaterials.includes(material.id) ? 'ring-2 ring-primary bg-primary/5' : ''
          } ${material.isUploaded ? 'border-green-200/60 bg-green-50/30' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getTypeIcon(material.type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg truncate">{material.title}</CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <Badge variant="secondary" className="text-xs w-fit">{material.classroom}</Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs w-fit ${
                          material.uploadedBy === 'teacher' 
                            ? 'border-blue-200 text-blue-700 bg-blue-50' 
                            : 'border-green-200 text-green-700 bg-green-50'
                        }`}
                      >
                        {material.uploadedBy === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{material.size}</span>
                    </CardDescription>
                  </div>
                </div>
                <Checkbox
                  checked={selectedMaterials.includes(material.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMaterials([...selectedMaterials, material.id]);
                    } else {
                      setSelectedMaterials(selectedMaterials.filter(id => id !== material.id));
                    }
                  }}
                  className="flex-shrink-0"
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 lg:space-y-4">
              <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">{material.description}</p>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleViewMaterial(material)} className="text-xs lg:text-sm">
                  <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs lg:text-sm"
                  onClick={() => handleDownload(material)}
                  disabled={downloading === material.id}
                >
                  {downloading === material.id ? (
                    <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  )}
                  {downloading === material.id ? 'Downloading...' : 'Download'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleChatWithMaterial(material)}
                  className="text-xs lg:text-sm"
                >
                  <Bot className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Summary Feature */}
      <Card className="shadow-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Material Summary
          </CardTitle>
          <CardDescription>
            Get AI-powered summaries and key insights from your learning materials, just like NotebookLM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              className="bg-gradient-primary" 
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary || selectedMaterials.length === 0}
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Summary for Selected Materials
                </>
              )}
            </Button>
            
            {selectedMaterials.length > 0 && (
              <Badge variant="secondary">
                {selectedMaterials.length} material(s) selected
              </Badge>
            )}
          </div>
          
          {generatedSummary && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  View Generated Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Generated Material Summary
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive analysis and insights from your selected learning materials
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <div className="prose prose-sm max-w-none">
                    {generatedSummary.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-semibold mb-3 mt-6">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-medium mb-2 mt-4">{line.substring(4)}</h3>;
                      } else if (line.startsWith('• ')) {
                        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
                      } else if (line.match(/^\d+\./)) {
                        return <li key={index} className="ml-4 mb-1 list-decimal">{line}</li>;
                      } else if (line.startsWith('*')) {
                        return <p key={index} className="text-sm text-muted-foreground italic mt-4">{line.substring(1)}</p>;
                      } else if (line.trim()) {
                        return <p key={index} className="mb-2">{line}</p>;
                      } else {
                        return <br key={index} />;
                      }
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Materials;