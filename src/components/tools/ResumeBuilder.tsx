import React, { useState } from 'react';
import { Briefcase, GraduationCap, User, Phone, Mail, MapPin, Printer, Copy, Check, Sparkles } from 'lucide-react';

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string;
}

export const ResumeBuilder: React.FC = () => {
  const [fullName, setFullName] = useState('Alex M. Reynolds');
  const [jobTitle, setJobTitle] = useState('Senior Operations & Project Manager');
  const [email, setEmail] = useState('alex.reynolds@email.com');
  const [phone, setPhone] = useState('+1 (555) 349-8201');
  const [location, setLocation] = useState('Dallas, TX (Open to Remote / Relocation)');
  const [summary, setSummary] = useState(
    'Results-driven Senior Operations Leader with 8+ years of experience streamlining cross-functional workflows, reducing operating costs by 22%, and scaling high-performing enterprise initiatives across North American markets.'
  );

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: '1',
      title: 'Lead Operations Project Manager',
      company: 'Apex Logistics Global',
      location: 'Dallas, TX',
      startDate: '2021',
      endDate: 'Present',
      highlights: '• Managed a $4.8M annual operational budget, delivering 100% of quarterly deliverables on schedule.\n• Spearheaded lean process automation resulting in $340K annual overhead reduction.\n• Mentored a 14-person cross-functional squad achieving 96% retention.'
    },
    {
      id: '2',
      title: 'Operations Analyst',
      company: 'Pinnacle Supply Solutions',
      location: 'Austin, TX',
      startDate: '2018',
      endDate: '2021',
      highlights: '• Evaluated vendor performance across 45 national distribution centers using SQL and Tableau.\n• Designed standardized SOP documentation adopted across 6 regional fulfillment hubs.'
    }
  ]);

  const [education, setEducation] = useState('Bachelor of Science in Business Administration • University of Texas at Dallas (2018)');
  const [skills, setSkills] = useState('Project Management (PMP), Agile/Scrum, Budget Forecasting, Six Sigma Green Belt, Jira, Tableau, SQL, Cross-Functional Leadership');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `${fullName.toUpperCase()}
${jobTitle}
${location} | ${phone} | ${email}

PROFESSIONAL SUMMARY
${summary}

WORK EXPERIENCE
${experiences.map(e => `${e.title.toUpperCase()} — ${e.company} (${e.startDate} - ${e.endDate})
${e.location}
${e.highlights}`).join('\n\n')}

EDUCATION
${education}

KEY SKILLS
${skills}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📄</span> ATS Resume Builder (USA Standard Format)
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Single-page, machine-readable format verified for Fortune 500 ATS scanners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#f97316] text-white hover:bg-orange-600 shadow-md cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Input Editor */}
        <div className="xl:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">City, State</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Professional Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Key Experience</label>
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="p-3 mb-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.title}
                    placeholder="Job Title"
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].title = e.target.value;
                      setExperiences(updated);
                    }}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    placeholder="Company"
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].company = e.target.value;
                      setExperiences(updated);
                    }}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={exp.highlights}
                  placeholder="Bullet points (use • prefix)"
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx].highlights = e.target.value;
                    setExperiences(updated);
                  }}
                  className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Education Credentials</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Key Skills & Certifications</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right: Clean Live US ATS Resume Document */}
        <div className="xl:col-span-6 bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl flex justify-center items-start">
          <div
            id="printable-area"
            className="w-full max-w-[560px] bg-white text-gray-900 p-8 rounded-lg shadow-xl border border-gray-300 text-left font-serif leading-normal"
            style={{ minHeight: '650px' }}
          >
            {/* Header */}
            <div className="text-center border-b-2 border-gray-900 pb-3 mb-4">
              <div className="text-2xl font-bold tracking-wider uppercase font-sans text-gray-900">{fullName}</div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mt-0.5 font-sans">{jobTitle}</p>
              <p className="text-[10px] text-gray-600 mt-1 font-sans">
                {location} • {phone} • {email}
              </p>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                Professional Summary
              </h3>
              <p className="text-[11px] text-gray-800 leading-relaxed font-sans">{summary}</p>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5 mb-2 font-sans">
                Professional Experience
              </h3>
              <div className="space-y-3 font-sans">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-gray-900">{exp.title}</span>
                      <span className="text-[10px] font-semibold text-gray-600">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-gray-700 italic mb-1">
                      <span>{exp.company}</span>
                      <span className="text-[10px] not-italic">{exp.location}</span>
                    </div>
                    <div className="text-[10px] text-gray-700 whitespace-pre-line leading-relaxed pl-1">
                      {exp.highlights}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-4 font-sans">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                Education
              </h3>
              <p className="text-[11px] text-gray-800">{education}</p>
            </div>

            {/* Skills */}
            <div className="font-sans">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                Core Competencies & Skills
              </h3>
              <p className="text-[11px] text-gray-800">{skills}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
