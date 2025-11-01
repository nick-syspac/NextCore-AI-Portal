'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LLNAssessment {
  id: string;
  assessment_number: string;
  student_name: string;
  student_id: string;
  assessment_date: string;
  learning_score: number;
  reading_score: number;
  writing_score: number;
  numeracy_score: number;
  oral_communication_score: number;
  overall_level: string;
  confidence: number;
  status: string;
  created_at: string;
}

interface SkillAnalysis {
  skill: string;
  level: number;
  description: string;
  indicators: string[];
  recommendations: string[];
}

interface StudentProfile {
  student_id: string;
  student_name: string;
  learning_level: string;
  reading_level: string;
  writing_level: string;
  numeracy_level: string;
  oral_communication_level: string;
  overall_acsf_level: string;
  confidence_score: number;
  assessment_count: number;
  last_assessment_date: string;
}

export default function LLNPredictorPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('assess');
  const [assessments, setAssessments] = useState<LLNAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<LLNAssessment | null>(null);
  const [skillAnalyses, setSkillAnalyses] = useState<SkillAnalysis[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [writingSample, setWritingSample] = useState('');
  const [readingResponse, setReadingResponse] = useState('');
  const [numeracyResponse, setNumeracyResponse] = useState('');
  const [oralResponse, setOralResponse] = useState('');

  // Statistics
  const totalAssessments = assessments.length;
  const avgConfidence =
    assessments.length > 0
      ? (assessments.reduce((sum, a) => sum + a.confidence, 0) / assessments.length).toFixed(1)
      : '0';
  const level1Count = assessments.filter(a => a.overall_level === 'Level 1').length;
  const level2Count = assessments.filter(a => a.overall_level === 'Level 2').length;
  const level3Count = assessments.filter(a => a.overall_level === 'Level 3').length;

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }
    // Load initial data here
  }, [router]);

  const handleAssess = async () => {
    if (!studentName || !studentId) {
      alert('Please enter student name and ID');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newAssessment: LLNAssessment = {
        id: `${Date.now()}`,
        assessment_number: `LLN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(assessments.length + 1).padStart(6, '0')}`,
        student_name: studentName,
        student_id: studentId,
        assessment_date: new Date().toISOString().split('T')[0],
        learning_score: Math.floor(Math.random() * 3) + 1,
        reading_score: Math.floor(Math.random() * 3) + 1,
        writing_score: Math.floor(Math.random() * 3) + 1,
        numeracy_score: Math.floor(Math.random() * 3) + 1,
        oral_communication_score: Math.floor(Math.random() * 3) + 1,
        overall_level: `Level ${Math.floor(Math.random() * 3) + 1}`,
        confidence: Math.floor(Math.random() * 30) + 70,
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      setAssessments([newAssessment, ...assessments]);
      setSelectedAssessment(newAssessment);
      setLoading(false);

      // Generate skill analyses
      const analyses: SkillAnalysis[] = [
        {
          skill: 'Learning',
          level: newAssessment.learning_score,
          description: getACSFDescription('Learning', newAssessment.learning_score),
          indicators: getACSFIndicators('Learning', newAssessment.learning_score),
          recommendations: getRecommendations('Learning', newAssessment.learning_score),
        },
        {
          skill: 'Reading',
          level: newAssessment.reading_score,
          description: getACSFDescription('Reading', newAssessment.reading_score),
          indicators: getACSFIndicators('Reading', newAssessment.reading_score),
          recommendations: getRecommendations('Reading', newAssessment.reading_score),
        },
        {
          skill: 'Writing',
          level: newAssessment.writing_score,
          description: getACSFDescription('Writing', newAssessment.writing_score),
          indicators: getACSFIndicators('Writing', newAssessment.writing_score),
          recommendations: getRecommendations('Writing', newAssessment.writing_score),
        },
        {
          skill: 'Numeracy',
          level: newAssessment.numeracy_score,
          description: getACSFDescription('Numeracy', newAssessment.numeracy_score),
          indicators: getACSFIndicators('Numeracy', newAssessment.numeracy_score),
          recommendations: getRecommendations('Numeracy', newAssessment.numeracy_score),
        },
        {
          skill: 'Oral Communication',
          level: newAssessment.oral_communication_score,
          description: getACSFDescription(
            'Oral Communication',
            newAssessment.oral_communication_score
          ),
          indicators: getACSFIndicators(
            'Oral Communication',
            newAssessment.oral_communication_score
          ),
          recommendations: getRecommendations(
            'Oral Communication',
            newAssessment.oral_communication_score
          ),
        },
      ];
      setSkillAnalyses(analyses);
      setActiveTab('results');
    }, 2000);
  };

  const getACSFDescription = (skill: string, level: number): string => {
    const descriptions: { [key: string]: { [key: number]: string } } = {
      Learning: {
        1: 'Can identify and recall simple information, follow routine procedures',
        2: 'Can understand relationships between ideas, adapt procedures to suit circumstances',
        3: 'Can evaluate information, adapt and develop new procedures',
      },
      Reading: {
        1: 'Can read and understand short simple texts on familiar topics',
        2: 'Can read and understand moderately complex texts on familiar topics',
        3: 'Can read and understand complex texts, including unfamiliar topics',
      },
      Writing: {
        1: 'Can write short simple texts for familiar contexts',
        2: 'Can write routine formal and informal texts of moderate complexity',
        3: 'Can write complex formal and informal texts',
      },
      Numeracy: {
        1: 'Can use simple mathematical information and perform simple calculations',
        2: 'Can use routine mathematical information and perform multiple step calculations',
        3: 'Can use and interpret complex mathematical information',
      },
      'Oral Communication': {
        1: 'Can communicate simple information and opinions in familiar contexts',
        2: 'Can communicate moderately complex information in familiar contexts',
        3: 'Can communicate complex information and persuade others',
      },
    };
    return descriptions[skill]?.[level] || 'No description available';
  };

  const getACSFIndicators = (skill: string, level: number): string[] => {
    const indicators: { [key: string]: { [key: number]: string[] } } = {
      Learning: {
        1: [
          'Follows simple instructions',
          'Recalls basic facts',
          'Uses familiar problem-solving strategies',
        ],
        2: [
          'Understands cause and effect',
          'Applies knowledge to new situations',
          'Plans and sequences tasks',
        ],
        3: [
          'Evaluates multiple sources',
          'Develops innovative solutions',
          'Reflects on learning processes',
        ],
      },
      Reading: {
        1: [
          'Reads simple sentences',
          'Identifies main ideas in short texts',
          'Uses basic vocabulary',
        ],
        2: [
          'Reads multi-paragraph texts',
          'Infers meaning from context',
          'Understands text structure',
        ],
        3: [
          'Analyzes complex arguments',
          'Synthesizes information from multiple sources',
          'Evaluates author perspective',
        ],
      },
      Writing: {
        1: ['Writes simple sentences', 'Uses basic punctuation', 'Conveys simple messages'],
        2: [
          'Writes paragraphs with topic sentences',
          'Uses varied sentence structures',
          'Organizes ideas logically',
        ],
        3: [
          'Writes essays with complex arguments',
          'Uses advanced vocabulary',
          'Adapts style to audience',
        ],
      },
      Numeracy: {
        1: [
          'Performs basic arithmetic',
          'Reads simple tables and graphs',
          'Uses everyday measurements',
        ],
        2: [
          'Calculates percentages and ratios',
          'Interprets statistical information',
          'Uses formulas',
        ],
        3: [
          'Analyzes complex data sets',
          'Uses advanced mathematical concepts',
          'Evaluates mathematical arguments',
        ],
      },
      'Oral Communication': {
        1: [
          'Speaks clearly in simple sentences',
          'Listens to simple instructions',
          'Asks basic questions',
        ],
        2: [
          'Presents information to small groups',
          'Engages in discussions',
          'Uses appropriate language register',
        ],
        3: [
          'Delivers formal presentations',
          'Negotiates and persuades',
          'Adapts communication to diverse audiences',
        ],
      },
    };
    return indicators[skill]?.[level] || ['No indicators available'];
  };

  const getRecommendations = (skill: string, level: number): string[] => {
    if (level === 1) {
      return [
        `Provide structured ${skill.toLowerCase()} activities with clear step-by-step guidance`,
        `Use visual aids and concrete examples to support ${skill.toLowerCase()} development`,
        `Break complex ${skill.toLowerCase()} tasks into smaller, manageable steps`,
        `Offer frequent feedback and scaffolding during ${skill.toLowerCase()} activities`,
      ];
    } else if (level === 2) {
      return [
        `Encourage application of ${skill.toLowerCase()} skills to new contexts`,
        `Provide opportunities for collaborative ${skill.toLowerCase()} activities`,
        `Introduce more complex ${skill.toLowerCase()} tasks with moderate support`,
        `Foster independence in ${skill.toLowerCase()} through guided practice`,
      ];
    } else {
      return [
        `Challenge with advanced ${skill.toLowerCase()} tasks requiring analysis and synthesis`,
        `Encourage peer mentoring in ${skill.toLowerCase()} activities`,
        `Provide opportunities for ${skill.toLowerCase()} in authentic workplace contexts`,
        `Support development of metacognitive ${skill.toLowerCase()} strategies`,
      ];
    }
  };

  const getLevelColor = (level: string | number): string => {
    const levelNum = typeof level === 'string' ? parseInt(level.replace(/\D/g, '')) : level;
    if (levelNum === 1) return 'text-red-600 bg-red-50';
    if (levelNum === 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/${tenantSlug}`}
                className="text-emerald-600 hover:text-emerald-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">LLN Predictor</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-medium rounded-full">
                📚 NLP + ACSF
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">LLN Predictor</h2>
          <p className="text-gray-600 mt-2">
            Assess student foundation skills using NLP + ACSF model for auto ACSF level predictions
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Assessments</div>
            <div className="text-3xl font-bold text-gray-900">{totalAssessments}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Avg Confidence</div>
            <div className="text-3xl font-bold text-gray-900">{avgConfidence}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cyan-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Level 1-2 Students</div>
            <div className="text-3xl font-bold text-gray-900">{level1Count + level2Count}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Level 3+ Students</div>
            <div className="text-3xl font-bold text-gray-900">{level3Count}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('assess')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'assess'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 New Assessment
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'results'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Results & Analysis
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Assessment History
              </button>
              <button
                onClick={() => setActiveTab('profiles')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profiles'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Student Profiles
              </button>
              <button
                onClick={() => setActiveTab('acsf')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'acsf'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 ACSF Framework
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* New Assessment Tab */}
            {activeTab === 'assess' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">New LLN Assessment</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter student information and provide samples for automated ACSF level
                    prediction
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="Enter student full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="Enter student ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Sample
                  </label>
                  <textarea
                    value={writingSample}
                    onChange={e => setWritingSample(e.target.value)}
                    placeholder="Paste or type student's writing sample (essay, report, email, etc.)"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 100 words recommended for accurate assessment
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading Comprehension Response
                  </label>
                  <textarea
                    value={readingResponse}
                    onChange={e => setReadingResponse(e.target.value)}
                    placeholder="Paste student's response to reading comprehension task"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numeracy Problem Response
                  </label>
                  <textarea
                    value={numeracyResponse}
                    onChange={e => setNumeracyResponse(e.target.value)}
                    placeholder="Paste student's response to numeracy problem or calculation"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oral Communication Notes
                  </label>
                  <textarea
                    value={oralResponse}
                    onChange={e => setOralResponse(e.target.value)}
                    placeholder="Enter notes from oral communication assessment (presentation, discussion, interview)"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAssess}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Analyzing with NLP + ACSF Model...
                      </span>
                    ) : (
                      '📊 Predict ACSF Levels'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setStudentName('');
                      setStudentId('');
                      setWritingSample('');
                      setReadingResponse('');
                      setNumeracyResponse('');
                      setOralResponse('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Clear Form
                  </button>
                </div>
              </div>
            )}

            {/* Results & Analysis Tab */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                {selectedAssessment ? (
                  <>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {selectedAssessment.student_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Student ID: {selectedAssessment.student_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            Assessment: {selectedAssessment.assessment_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {selectedAssessment.assessment_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-block px-4 py-2 rounded-lg font-semibold ${getLevelColor(selectedAssessment.overall_level)}`}
                          >
                            Overall: {selectedAssessment.overall_level}
                          </div>
                          <div
                            className={`text-sm mt-2 font-medium ${getConfidenceColor(selectedAssessment.confidence)}`}
                          >
                            Confidence: {selectedAssessment.confidence}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600 mb-1">Learning</div>
                          <div
                            className={`text-lg font-bold px-2 py-1 rounded ${getLevelColor(selectedAssessment.learning_score)}`}
                          >
                            Level {selectedAssessment.learning_score}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600 mb-1">Reading</div>
                          <div
                            className={`text-lg font-bold px-2 py-1 rounded ${getLevelColor(selectedAssessment.reading_score)}`}
                          >
                            Level {selectedAssessment.reading_score}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600 mb-1">Writing</div>
                          <div
                            className={`text-lg font-bold px-2 py-1 rounded ${getLevelColor(selectedAssessment.writing_score)}`}
                          >
                            Level {selectedAssessment.writing_score}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600 mb-1">Numeracy</div>
                          <div
                            className={`text-lg font-bold px-2 py-1 rounded ${getLevelColor(selectedAssessment.numeracy_score)}`}
                          >
                            Level {selectedAssessment.numeracy_score}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600 mb-1">Oral Comm</div>
                          <div
                            className={`text-lg font-bold px-2 py-1 rounded ${getLevelColor(selectedAssessment.oral_communication_score)}`}
                          >
                            Level {selectedAssessment.oral_communication_score}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Skill Analysis */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Detailed ACSF Skill Analysis
                      </h4>
                      <div className="space-y-4">
                        {skillAnalyses.map((analysis, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 p-5"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-md font-semibold text-gray-900">
                                {analysis.skill}
                              </h5>
                              <span
                                className={`px-3 py-1 rounded-lg font-semibold text-sm ${getLevelColor(analysis.level)}`}
                              >
                                ACSF Level {analysis.level}
                              </span>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-700">{analysis.description}</p>
                            </div>

                            <div className="mb-3">
                              <h6 className="text-sm font-semibold text-gray-900 mb-2">
                                Performance Indicators:
                              </h6>
                              <ul className="list-disc list-inside space-y-1">
                                {analysis.indicators.map((indicator, i) => (
                                  <li key={i} className="text-sm text-gray-600">
                                    {indicator}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h6 className="text-sm font-semibold text-gray-900 mb-2">
                                Teaching Recommendations:
                              </h6>
                              <ul className="list-disc list-inside space-y-1">
                                {analysis.recommendations.map((rec, i) => (
                                  <li key={i} className="text-sm text-emerald-700">
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-600">
                      No assessment selected. Complete a new assessment to view results.
                    </p>
                    <button
                      onClick={() => setActiveTab('assess')}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Create New Assessment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Assessment History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assessment History</h3>
                  <button
                    onClick={() => setActiveTab('assess')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                  >
                    + New Assessment
                  </button>
                </div>

                {assessments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Assessment #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Overall Level
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Confidence
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assessments.map(assessment => (
                          <tr key={assessment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                              {assessment.assessment_number}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">
                                {assessment.student_name}
                              </div>
                              <div className="text-gray-500 text-xs">{assessment.student_id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {assessment.assessment_date}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded font-semibold ${getLevelColor(assessment.overall_level)}`}
                              >
                                {assessment.overall_level}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`font-semibold ${getConfidenceColor(assessment.confidence)}`}
                              >
                                {assessment.confidence}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => {
                                  setSelectedAssessment(assessment);
                                  setActiveTab('results');
                                }}
                                className="text-emerald-600 hover:text-emerald-800 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-600 mb-4">No assessments completed yet</p>
                    <button
                      onClick={() => setActiveTab('assess')}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Create First Assessment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Student Profiles Tab */}
            {activeTab === 'profiles' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student LLN Profiles</h3>
                {assessments.length > 0 ? (
                  <div className="grid gap-4">
                    {Array.from(new Set(assessments.map(a => a.student_id))).map(studentId => {
                      const studentAssessments = assessments.filter(
                        a => a.student_id === studentId
                      );
                      const latest = studentAssessments[0];
                      return (
                        <div
                          key={studentId}
                          className="bg-white rounded-lg border border-gray-200 p-5"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {latest.student_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Student ID: {latest.student_id}
                              </p>
                              <p className="text-sm text-gray-600">
                                {studentAssessments.length} assessment(s) completed
                              </p>
                              <p className="text-sm text-gray-600">
                                Last assessed: {latest.assessment_date}
                              </p>
                            </div>
                            <span
                              className={`px-4 py-2 rounded-lg font-semibold ${getLevelColor(latest.overall_level)}`}
                            >
                              {latest.overall_level}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Learning</div>
                              <div
                                className={`text-sm font-bold px-2 py-1 rounded ${getLevelColor(latest.learning_score)}`}
                              >
                                L{latest.learning_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Reading</div>
                              <div
                                className={`text-sm font-bold px-2 py-1 rounded ${getLevelColor(latest.reading_score)}`}
                              >
                                L{latest.reading_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Writing</div>
                              <div
                                className={`text-sm font-bold px-2 py-1 rounded ${getLevelColor(latest.writing_score)}`}
                              >
                                L{latest.writing_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Numeracy</div>
                              <div
                                className={`text-sm font-bold px-2 py-1 rounded ${getLevelColor(latest.numeracy_score)}`}
                              >
                                L{latest.numeracy_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Oral</div>
                              <div
                                className={`text-sm font-bold px-2 py-1 rounded ${getLevelColor(latest.oral_communication_score)}`}
                              >
                                L{latest.oral_communication_score}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-600">
                      No student profiles yet. Complete assessments to build profiles.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ACSF Framework Tab */}
            {activeTab === 'acsf' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Australian Core Skills Framework (ACSF)
                  </h3>
                  <p className="text-sm text-gray-600">
                    The ACSF describes five core skills (Learning, Reading, Writing, Numeracy, Oral
                    Communication) across five performance levels. This tool uses NLP to
                    automatically predict ACSF levels.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Level 1 - Foundation</h4>
                    <p className="text-sm text-gray-700">
                      Can perform simple, routine tasks with concrete information in familiar
                      contexts. Requires high level of support. Suitable for pre-vocational or basic
                      workplace tasks.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Level 2 - Basic</h4>
                    <p className="text-sm text-gray-700">
                      Can perform routine tasks with some complexity in familiar contexts. Requires
                      some support. Suitable for entry-level employment and further training.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Level 3 - Intermediate</h4>
                    <p className="text-sm text-gray-700">
                      Can perform moderately complex tasks in a range of contexts. Requires limited
                      support. Suitable for independent workplace performance and vocational
                      education entry.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Level 4 - Advanced</h4>
                    <p className="text-sm text-gray-700">
                      Can perform complex tasks independently across varied contexts. Minimal
                      support needed. Suitable for diploma-level study and specialized roles.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Level 5 - Expert</h4>
                    <p className="text-sm text-gray-700">
                      Can perform highly complex and non-routine tasks. Works independently with
                      initiative. Suitable for degree-level study and professional roles.
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-200">
                  <h4 className="font-semibold text-gray-900 mb-2">🤖 NLP-Powered Prediction</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    This tool uses Natural Language Processing to analyze student responses and
                    automatically predict ACSF levels across all five core skills:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Vocabulary complexity and range analysis</li>
                    <li>Sentence structure and grammatical complexity</li>
                    <li>Coherence and organization assessment</li>
                    <li>Reasoning and problem-solving indicators</li>
                    <li>Contextual appropriateness evaluation</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
