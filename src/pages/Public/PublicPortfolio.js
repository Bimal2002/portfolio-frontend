import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { userService, portfolioService, projectService, skillService, educationService, experienceService, socialService, analyticsService, newsletterService } from '../../services/dataService';
import ContactForm from '../../components/ContactForm';
import MeetingRequestForm from '../../components/MeetingRequestForm';
import { 
  FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaExternalLinkAlt, FaStar, FaTimes, 
  FaCalendar, FaCode, FaFilePdf, FaChevronLeft, FaChevronRight, FaImages,
  FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaMedium, FaDev, FaStackOverflow, FaLink,
  FaBriefcase, FaGraduationCap, FaMapMarkerAlt, FaDatabase, FaServer, FaPalette, 
  FaTools, FaCloud, FaUsers, FaCogs, FaPhone, FaEnvelopeOpen, FaCheckCircle
} from 'react-icons/fa';

// Social platform icons mapping
const SOCIAL_ICONS = {
  'LinkedIn': FaLinkedin,
  'GitHub': FaGithub,
  'Twitter': FaTwitter,
  'Facebook': FaFacebook,
  'Instagram': FaInstagram,
  'YouTube': FaYoutube,
  'Medium': FaMedium,
  'Dev.to': FaDev,
  'Stack Overflow': FaStackOverflow,
  'Portfolio': FaGlobe,
  'Other': FaLink
};

const SOCIAL_COLORS = {
  'LinkedIn': 'text-blue-600 hover:text-blue-700',
  'GitHub': 'text-gray-800 hover:text-gray-900',
  'Twitter': 'text-sky-500 hover:text-sky-600',
  'Facebook': 'text-blue-700 hover:text-blue-800',
  'Instagram': 'text-pink-600 hover:text-pink-700',
  'YouTube': 'text-red-600 hover:text-red-700',
  'Medium': 'text-gray-900 hover:text-black',
  'Dev.to': 'text-gray-900 hover:text-black',
  'Stack Overflow': 'text-orange-500 hover:text-orange-600',
  'Portfolio': 'text-green-600 hover:text-green-700',
  'Other': 'text-gray-600 hover:text-gray-700'
};

// Skill category icons
const SKILL_ICONS = {
  'Programming Languages': FaCode,
  'Frontend': FaPalette,
  'Backend': FaServer,
  'Database': FaDatabase,
  'DevOps': FaCloud,
  'Tools': FaTools,
  'Soft Skills': FaUsers,
  'Other': FaCogs
};

const PublicPortfolio = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [hasPayment, setHasPayment] = useState(false);

  const fetchPortfolioData = React.useCallback(async () => {
    try {
      const userData = await userService.getByUsername(username);
      const portfolioData = await portfolioService.getByUsername(username);
      
      const userId = userData.data._id;
      
      // Fetch all data in parallel
      const [projectsData, skillsData, educationData, experienceData, socialData] = await Promise.all([
        projectService.getByUser(userId).catch(() => ({ data: [] })),
        skillService.getByUser(userId).catch(() => ({ data: [] })),
        educationService.getByUser(userId).catch(() => ({ data: [] })),
        experienceService.getByUser(userId).catch(() => ({ data: [] })),
        socialService.getByUser(userId).catch(() => ({ data: [] }))
      ]);

      setUser(userData.data);
      setPortfolio(portfolioData.data);
      setProjects((projectsData.data || []).filter(p => p.isVisible !== false));
      setSkills((skillsData.data || []).filter(s => s.isVisible !== false));
      setEducation((educationData.data || []).filter(e => e.isVisible !== false));
      setExperience((experienceData.data || []).filter(e => e.isVisible !== false));
      setSocialLinks((socialData.data || []).filter(s => s.isVisible !== false));
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Log visit once data is fetched
  useEffect(() => {
    if (user) {
      analyticsService.logVisit({ ownerId: user._id }).catch(() => {});
    }
  }, [user]);

  // Group skills by category
  const groupedSkills = useMemo(() => {
    return skills.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Portfolio Not Found</h1>
          <p className="text-gray-600">The portfolio you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim() || !user?._id) return;
    setSubscribing(true);
    try {
      await newsletterService.subscribe(user._id, subscribeEmail);
      setSubscribeEmail('');
      alert('Subscribed!');
    } catch (err) {
      alert('Subscription failed.');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
    setPaymentSuccess(false);
  };

  const handleProcessPayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setHasPayment(true);
      setTimeout(() => {
        setShowPaymentModal(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-10 h-10 rounded-full border-2 border-primary-600"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user?.fullName}</h1>
              {portfolio?.tagline && (
                <p className="text-xs text-gray-600">{portfolio.tagline}</p>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('home')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'home'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Home
            </button>
            {experience.length > 0 && (
              <button
                onClick={() => scrollToSection('experience')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'experience'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Experience
              </button>
            )}
            {education.length > 0 && (
              <button
                onClick={() => scrollToSection('education')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'education'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Education
              </button>
            )}
            {Object.keys(groupedSkills).length > 0 && (
              <button
                onClick={() => scrollToSection('skills')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'skills'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Skills
              </button>
            )}
            {projects.length > 0 && (
              <button
                onClick={() => scrollToSection('projects')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'projects'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Projects
              </button>
            )}
            <button
              onClick={() => scrollToSection('contact')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'contact'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Contact
            </button>
          </div>

          <a
            href={`mailto:${user?.email}`}
            className="btn-primary btn-sm hidden md:inline-flex items-center"
          >
            <FaEnvelope className="mr-2" />
            Contact Me
          </a>
        </div>
      </nav>

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <section id="home" className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-lg"
              />
            )}
            <h1 className="text-5xl font-bold mb-4">{user.fullName}</h1>
            {portfolio.tagline && (
              <p className="text-2xl mb-6 opacity-90">{portfolio.tagline}</p>
            )}
            {portfolio.bio && (
              <p className="text-lg max-w-2xl mx-auto opacity-80">{portfolio.bio}</p>
            )}
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center space-x-4 mt-6">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform] || FaLink;
                  return (
                    <a
                      key={link._id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      title={link.platform}
                    >
                      <Icon className="text-xl" />
                    </a>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-center space-x-4 mt-8">
              <a
                href={`mailto:${user.email}`}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                <FaEnvelope className="mr-2" />
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      {Object.keys(groupedSkills).length > 0 && (
        <section id="skills" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <FaCode className="mr-3 text-primary-600" /> Skills & Technologies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => {
                const CategoryIcon = SKILL_ICONS[category] || FaCode;
                return (
                  <div key={category} className="card">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                        <CategoryIcon />
                      </div>
                      <h3 className="font-bold text-gray-900">{category}</h3>
                    </div>
                    <div className="space-y-3">
                      {categorySkills.map((skill) => (
                        <div key={skill._id}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                            <span className="text-xs text-gray-500">{skill.proficiency}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.proficiencyLevel || 50}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <section id="experience" className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <FaBriefcase className="mr-3 text-primary-600" /> Work Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={exp._id} className="card relative">
                  {index < experience.length - 1 && (
                    <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200 -mb-6" />
                  )}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <FaBriefcase />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{exp.position}</h3>
                          <p className="text-primary-600 font-medium">{exp.company}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500 flex items-center">
                            <FaCalendar className="mr-1" />
                            {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {' - '}
                            {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                          {exp.location && (
                            <span className="text-sm text-gray-500 flex items-center justify-end mt-1">
                              <FaMapMarkerAlt className="mr-1" /> {exp.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-600 mt-3">{exp.description}</p>
                      )}
                      {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exp.technologies.map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <section id="education" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <FaGraduationCap className="mr-3 text-primary-600" /> Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education.map((edu) => (
                <div key={edu._id} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaGraduationCap className="text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-primary-600">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        {new Date(edu.startDate).getFullYear()}
                        {' - '}
                        {edu.isCurrent ? 'Present' : new Date(edu.endDate).getFullYear()}
                      </p>
                      {edu.grade && (
                        <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {portfolio.sections?.projects && featuredProjects.length > 0 && (
        <section id="projects" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center mb-8">
              <FaStar className="text-yellow-500 mr-3 text-2xl" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Projects</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProjects.map((project) => (
                <div 
                  key={project._id} 
                  className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.thumbnail ? (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                          <FaStar className="mr-1" /> Featured
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <FaCode className="text-6xl text-white/50" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 5).map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 5 && (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                            +{project.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                        >
                          <FaExternalLinkAlt className="mr-2" /> Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center"
                        >
                          <FaGithub className="mr-2" /> Source Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects Section */}
      {portfolio.sections?.projects && regularProjects.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {featuredProjects.length > 0 ? 'Other Projects' : 'Projects'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularProjects.map((project) => (
                <div 
                  key={project._id} 
                  className="card hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                      <FaCode className="text-4xl text-primary-400" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                      >
                        <FaGlobe className="mr-1" /> Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                      >
                        <FaGithub className="mr-1" /> Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Projects Message */}
      {portfolio.sections?.projects && projects.length === 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <FaCode className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Projects Yet</h2>
            <p className="text-gray-500">Projects will appear here once added.</p>
          </div>
        </section>
      )}

      {/* Removed legacy contact section; using the enhanced contact form below */}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            {selectedProject.thumbnail ? (
              <div className="relative h-64 md:h-80">
                <img
                  src={selectedProject.thumbnail}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center space-x-3 mb-2">
                    {selectedProject.featured && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                        <FaStar className="mr-1" /> Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedProject.title}</h2>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 p-8">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
                <div className="flex items-center space-x-3 mb-2">
                  {selectedProject.featured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                      <FaStar className="mr-1" /> Featured
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedProject.title}</h2>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 md:p-8">
              {/* Dates */}
              {(selectedProject.startDate || selectedProject.isOngoing) && (
                <p className="text-sm text-gray-500 mb-4 flex items-center">
                  <FaCalendar className="mr-2" />
                  {selectedProject.startDate && new Date(selectedProject.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {' - '}
                  {selectedProject.isOngoing ? 'Present' : selectedProject.endDate && new Date(selectedProject.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}

              {/* Description */}
              <p className="text-gray-700 text-lg mb-6">{selectedProject.description}</p>
              
              {/* Long Description */}
              {selectedProject.longDescription && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Project</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedProject.longDescription}</p>
                </div>
              )}

              {/* Technologies */}
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Images Gallery */}
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaImages className="mr-2" /> Project Screenshots
                  </h3>
                  <div className="relative">
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={selectedProject.images[activeImageIndex]?.url}
                        alt={selectedProject.images[activeImageIndex]?.caption || `Screenshot ${activeImageIndex + 1}`}
                        className="w-full h-64 md:h-96 object-contain bg-gray-100"
                      />
                    </div>
                    {selectedProject.images[activeImageIndex]?.caption && (
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {selectedProject.images[activeImageIndex].caption}
                      </p>
                    )}
                    {selectedProject.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex(prev => prev === 0 ? selectedProject.images.length - 1 : prev - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex(prev => prev === selectedProject.images.length - 1 ? 0 : prev + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {selectedProject.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {selectedProject.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            activeImageIndex === index ? 'border-primary-500' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.caption || `Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Project Documents */}
              {selectedProject.documents && selectedProject.documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaFilePdf className="mr-2 text-red-500" /> Project Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedProject.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaFilePdf className="text-red-500 text-xl mr-3" />
                        <span className="text-gray-700 font-medium">{doc.name || 'Document'}</span>
                        <FaExternalLinkAlt className="ml-auto text-gray-400 text-sm" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center"
                  >
                    <FaExternalLinkAlt className="mr-2" /> View Live Demo
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center"
                  >
                    <FaGithub className="mr-2" /> View Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Have a question or proposal? I'd love to hear from you!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Email Contact Card */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaEnvelopeOpen className="text-4xl text-primary-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <a 
                href={`mailto:${user.email}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {user.email}
              </a>
            </div>

            {/* Phone Contact Card */}
            {portfolio?.phone && (
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <FaPhone className="text-4xl text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Phone</h3>
                <a 
                  href={`tel:${portfolio.phone}`}
                  className="text-green-600 hover:text-green-700"
                >
                  {portfolio.phone}
                </a>
              </div>
            )}

            {/* Location Card */}
            {portfolio?.location && (
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <FaMapMarkerAlt className="text-4xl text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Location</h3>
                <p className="text-gray-600">{portfolio.location}</p>
              </div>
            )}
          </div>

      {/* Contact and Meeting Request */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
              <ContactForm userId={user._id} userName={user.fullName} />
            </div>
            {!hasPayment ? (
              <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col justify-center items-center text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCalendar className="text-3xl text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Request a Meeting</h3>
                  <p className="text-gray-600 mb-4">
                    Schedule a meeting to discuss your needs and opportunities.
                  </p>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-primary-700 font-medium">One-time Payment: $5</p>
                  </div>
                  <button
                    onClick={handlePaymentClick}
                    className="btn-primary w-full inline-flex items-center justify-center"
                  >
                    <FaEnvelope className="mr-2" />
                    Unlock Meeting Requests
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Request a Meeting</h3>
                <MeetingRequestForm userId={user._id} userName={user.fullName} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !paymentSuccess && setShowPaymentModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {!paymentSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaEnvelope className="text-3xl text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Meeting Requests</h2>
                  <p className="text-gray-600">One-time payment to schedule meetings</p>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Amount</span>
                    <span className="text-2xl font-bold text-primary-600">$5</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Pay once to unlock meeting request feature</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" defaultChecked className="mr-3" />
                    <span className="text-sm font-medium text-gray-900">Demo Card: 4242 4242 4242 4242</span>
                  </label>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleProcessPayment}
                    disabled={paymentProcessing}
                    className="btn-primary w-full inline-flex items-center justify-center disabled:opacity-50"
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2" />
                        Pay $5 to Continue
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="btn-secondary w-full"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  This is a demo payment. Use the card above to test.
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-3xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600">You can now request meetings.</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Footer with Newsletter and Copyright */}
      <footer className="bg-primary-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-8">
            {/* Newsletter Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-primary-100 mb-4">Subscribe to get the latest updates and news.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded bg-primary-800 text-white placeholder-primary-300 border border-primary-700 focus:outline-none focus:border-primary-500"
                />
                <button type="submit" disabled={subscribing} className="btn-primary">
                  {subscribing ? '...' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Follow</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((link) => {
                    const Icon = SOCIAL_ICONS[link.platform] || FaLink;
                    return (
                      <a
                        key={link._id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-3xl ${SOCIAL_COLORS[link.platform] || 'text-primary-300 hover:text-white'} transition-colors`}
                        title={link.platform}
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-primary-700 pt-8 mt-8 text-center">
            <p className="text-primary-200 mb-2">
              © {new Date().getFullYear()} {user.fullName}. All rights reserved.
            </p>
            <a 
              href={`mailto:${user.email}`}
              className="text-primary-300 hover:text-white transition-colors"
            >
              {user.email}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
