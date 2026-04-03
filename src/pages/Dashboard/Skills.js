import React, { useState, useEffect } from 'react';
import { skillService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaCode, FaEye, FaEyeSlash,
  FaDatabase, FaServer, FaPalette, FaTools, FaCloud, FaUsers, FaCogs
} from 'react-icons/fa';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [groupedSkills, setGroupedSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const categories = [
    'Programming Languages',
    'Frontend',
    'Backend',
    'Database',
    'DevOps',
    'Tools',
    'Soft Skills',
    'Other'
  ];

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming Languages',
    proficiency: 'Intermediate',
    proficiencyLevel: 50,
    icon: '',
    isVisible: true
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await skillService.getAll();
      const skillsData = response.data || [];
      setSkills(skillsData);
      
      // Group by category
      const grouped = skillsData.reduce((acc, skill) => {
        const cat = skill.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
      }, {});
      setGroupedSkills(grouped);
    } catch (error) {
      toast.error('Failed to fetch skills');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Programming Languages',
      proficiency: 'Intermediate',
      proficiencyLevel: 50,
      icon: '',
      isVisible: true
    });
    setEditingSkill(null);
  };

  const openAddModal = (category = 'Programming Languages') => {
    resetForm();
    setFormData(prev => ({ ...prev, category }));
    setShowModal(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'Programming Languages',
      proficiency: skill.proficiency || 'Intermediate',
      proficiencyLevel: skill.proficiencyLevel || 50,
      icon: skill.icon || '',
      isVisible: skill.isVisible !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProficiencyChange = (level) => {
    const levelMap = {
      'Beginner': 25,
      'Intermediate': 50,
      'Advanced': 75,
      'Expert': 95
    };
    setFormData(prev => ({
      ...prev,
      proficiency: level,
      proficiencyLevel: levelMap[level]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingSkill) {
        await skillService.update(editingSkill._id, formData);
        toast.success('Skill updated successfully');
      } else {
        await skillService.create(formData);
        toast.success('Skill added successfully');
      }
      
      closeModal();
      fetchSkills();
    } catch (error) {
      toast.error(editingSkill ? 'Failed to update skill' : 'Failed to add skill');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await skillService.delete(id);
      toast.success('Skill deleted successfully');
      setDeleteConfirm(null);
      fetchSkills();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const toggleVisibility = async (skill) => {
    try {
      await skillService.update(skill._id, { isVisible: !skill.isVisible });
      toast.success(`Skill ${skill.isVisible ? 'hidden' : 'shown'} on portfolio`);
      fetchSkills();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Programming Languages': <FaCode />,
      'Frontend': <FaPalette />,
      'Backend': <FaServer />,
      'Database': <FaDatabase />,
      'DevOps': <FaCloud />,
      'Tools': <FaTools />,
      'Soft Skills': <FaUsers />,
      'Other': <FaCogs />
    };
    return icons[category] || <FaCode />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming Languages': 'bg-purple-100 text-purple-600 border-purple-200',
      'Frontend': 'bg-blue-100 text-blue-600 border-blue-200',
      'Backend': 'bg-green-100 text-green-600 border-green-200',
      'Database': 'bg-orange-100 text-orange-600 border-orange-200',
      'DevOps': 'bg-cyan-100 text-cyan-600 border-cyan-200',
      'Tools': 'bg-gray-100 text-gray-600 border-gray-200',
      'Soft Skills': 'bg-pink-100 text-pink-600 border-pink-200',
      'Other': 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getProficiencyColor = (level) => {
    const colors = {
      'Beginner': 'bg-gray-400',
      'Intermediate': 'bg-blue-500',
      'Advanced': 'bg-green-500',
      'Expert': 'bg-purple-500'
    };
    return colors[level] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-600 mt-1">Manage your technical and soft skills</p>
        </div>
        <button onClick={() => openAddModal()} className="btn-primary inline-flex items-center">
          <FaPlus className="mr-2" /> Add Skill
        </button>
      </div>

      {/* Skills by Category */}
      {skills.length === 0 ? (
        <div className="card text-center py-12">
          <FaCode className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No skills yet</h3>
          <p className="text-gray-500 mb-4">Add your first skill to showcase your expertise</p>
          <button onClick={() => openAddModal()} className="btn-primary inline-flex items-center">
            <FaPlus className="mr-2" /> Add Skill
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const categorySkills = groupedSkills[category];
            if (!categorySkills || categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="card">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-500">({categorySkills.length})</span>
                  </div>
                  <button
                    onClick={() => openAddModal(category)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill._id}
                      className={`p-4 border rounded-lg ${!skill.isVisible ? 'opacity-60' : ''} ${getCategoryColor(category)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                            {!skill.isVisible && <FaEyeSlash className="text-gray-400 text-sm" />}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getProficiencyColor(skill.proficiency)} text-white`}>
                            {skill.proficiency}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => toggleVisibility(skill)}
                            className={`p-1.5 rounded transition-colors ${
                              skill.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {skill.isVisible ? <FaEye className="text-sm" /> : <FaEyeSlash className="text-sm" />}
                          </button>
                          <button
                            onClick={() => openEditModal(skill)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(skill._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Proficiency Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Proficiency</span>
                          <span>{skill.proficiencyLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProficiencyColor(skill.proficiency)}`}
                            style={{ width: `${skill.proficiencyLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Buttons for Empty Categories */}
      {skills.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add skills to other categories:</h4>
          <div className="flex flex-wrap gap-2">
            {categories.filter(cat => !groupedSkills[cat] || groupedSkills[cat].length === 0).map(cat => (
              <button
                key={cat}
                onClick={() => openAddModal(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors hover:shadow-md ${getCategoryColor(cat)}`}
              >
                <FaPlus className="inline mr-1 text-xs" /> {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSkill ? 'Edit Skill' : 'Add Skill'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., JavaScript, React, Python"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {proficiencyLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleProficiencyChange(level)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        formData.proficiency === level
                          ? `${getProficiencyColor(level)} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Proficiency: {formData.proficiencyLevel}%
                </label>
                <input
                  type="range"
                  name="proficiencyLevel"
                  value={formData.proficiencyLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Visible on Portfolio</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : editingSkill ? 'Update' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Skill?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this skill? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
