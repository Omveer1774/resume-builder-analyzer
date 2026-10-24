import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./style.css";

const API = "http://localhost:5000/api";
const initial = {
  name: "", role: "Full Stack Developer", email: "", phone: "", location: "India",
  summary: "", skills: "JavaScript, React.js, Node.js, MongoDB, Python, SQL",
  education: "", experience: "", projects: ""
};
const fields = [
  ["name","Full name"],["role","Target role"],["email","Email"],["phone","Phone"],
  ["location","Location"],["summary","Professional summary"],["skills","Skills"],
  ["education","Education"],["experience","Experience"],["projects","Projects"]
];
const templates = ["Modern", "Classic", "Minimal"];

export default function App() {
  const [data,setData] = useState(initial);
  const [job,setJob] = useState("");
  const [analysis,setAnalysis] = useState(null);
  const [loading,setLoading] = useState(false);
  const [saving,setSaving] = useState(false);
  const [savedResumes,setSavedResumes] = useState([]);
  const [message,setMessage] = useState("");
  const [search,setSearch] = useState("");
  const [dark,setDark] = useState(false);
  const [template,setTemplate] = useState("Modern");
  const [editingId,setEditingId] = useState(null);

  const update = e => setData({...data,[e.target.name]:e.target.value});
  const filtered = useMemo(() => savedResumes.filter(r =>
    `${r.resume?.name||""} ${r.resume?.role||""} ${r.resume?.email||""}`.toLowerCase().includes(search.toLowerCase())
  ),[savedResumes,search]);

  const loadSavedResumes = async (quiet=false) => {
    try { const r=await axios.get(`${API}/resumes`); setSavedResumes(r.data); if(!quiet)setMessage("Resume library updated."); }
    catch { if(!quiet)setMessage("Could not load resumes. Check backend and MongoDB."); }
  };
  useEffect(()=>{loadSavedResumes(true)},[]);
  const analyze = async () => {
    setLoading(true); setMessage("");
    try { const r=await axios.post(`${API}/analyze`,{resume:data,jobDescription:job}); setAnalysis(r.data); setMessage("ATS analysis completed."); }
    catch { setMessage("Analysis failed. Start the backend and MongoDB first."); }
    finally {setLoading(false);}
  };
  const saveResume = async () => {
    setSaving(true); setMessage("");
    try {
      const payload={resume:data,jobDescription:job,analysis:analysis||{},template};
      if(editingId) await axios.put(`${API}/resumes/${editingId}`,payload);
      else await axios.post(`${API}/resumes`,payload);
      setMessage(editingId ? "Resume changes saved." : "Resume saved to your library.");
      setEditingId(null); await loadSavedResumes(true);
    } catch {setMessage("Could not save. Make sure backend and MongoDB are running.");}
    finally {setSaving(false);}
  };
  const useSavedResume = item => {
    setData({...initial,...(item.resume||{})}); setJob(item.jobDescription||"");
    setAnalysis(item.analysis?.score!==undefined?item.analysis:null);
    setTemplate(item.template||"Modern"); setEditingId(item._id);
    setMessage(`Editing ${item.resume?.name||"saved resume"}.`);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const deleteResume = async id => {
    if(!window.confirm("Delete this resume permanently?")) return;
    try {await axios.delete(`${API}/resumes/${id}`); if(editingId===id)setEditingId(null); await loadSavedResumes(true); setMessage("Resume deleted.");}
    catch {setMessage("Could not delete resume.");}
  };
  const newResume = () => {setData(initial);setJob("");setAnalysis(null);setEditingId(null);setMessage("New resume started.");};
  const download = async () => {
    const el=document.getElementById("resume-preview"); if(!el)return;
    try {
      const canvas=await html2canvas(el,{scale:2,backgroundColor:"#ffffff",useCORS:true});
      const pdf=new jsPDF("p","mm","a4"); const width=190; const height=canvas.height*width/canvas.width;
      const pageHeight=277; let remaining=height; let position=0; const img=canvas.toDataURL("image/png");
      pdf.addImage(img,"PNG",10,10,width,height); remaining-=pageHeight;
      while(remaining>0){position=remaining-height;pdf.addPage();pdf.addImage(img,"PNG",10,position+10,width,height);remaining-=pageHeight;}
      pdf.save(`${(data.name||"resume").trim().replace(/\s+/g,"-").toLowerCase()}.pdf`);
      setMessage("PDF exported successfully.");
    } catch {setMessage("PDF export failed. Try again.");}
  };

  return <div className={`app ${dark?"dark":""}`}>
    <header className="topbar"><div className="brand"><div className="brand-icon">✦</div><div><b>Resumint</b><small>CAREER STUDIO</small></div></div>
      <nav><a href="#builder">Builder</a><a href="#analyzer">ATS Analyzer</a><a href="#library">My Library</a></nav>
      <button className="theme-btn" onClick={()=>setDark(!dark)} aria-label="Toggle dark mode">{dark?"☀️":"🌙"} <span>{dark?"Light":"Dark"} mode</span></button>
    </header>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> YOUR NEXT CHAPTER STARTS HERE</div>
      <h1>Make your experience<br/><em>impossible to ignore.</em></h1>
      <p>Create a polished, ATS-friendly resume in minutes. Tailor it to your dream role and track every version in one place.</p>
      <div className="hero-actions"><a className="primary" href="#builder">Build my resume <span>↗</span></a><a className="text-link" href="#analyzer">Check ATS score ↓</a></div>
      <div className="hero-proof"><div className="avatars"><i>✦</i><i>✧</i><i>✳</i></div><span><b>One workspace.</b> A stronger first impression.</span></div>
    </div><div className="hero-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="floating-tag tag-top">✦ ATS ready</div><div className="mock-resume"><div className="mock-top"><div className="mock-avatar">R</div><div><b>YOUR NAME</b><small>CREATIVE PROFESSIONAL</small></div><div className="mock-lines"><i/><i/></div></div><div className="mock-rule"/><div className="mock-columns"><div><b>PROFILE</b><i/><i/><i/><br/><b>EXPERIENCE</b><i/><i/><i/><i/></div><div><b>SKILLS</b><span className="skill-chip">Strategy</span><span className="skill-chip">Leadership</span><span className="skill-chip">Design</span><br/><b>EDUCATION</b><i/><i/></div></div><div className="mock-footer">CRAFTED WITH PURPOSE <span>✦</span></div></div><div className="floating-tag tag-bottom"><span>✓</span> Ready to stand out</div></div></section>
    <div className="stats"><div><b>01</b><span>Build beautifully</span></div><div><b>02</b><span>Optimize for ATS</span></div><div><b>03</b><span>Save every version</span></div><div className="stats-note">YOUR CAREER, WELL PRESENTED <span>↗</span></div></div>
    <main className="workspace">
      <section id="builder" className="section-heading"><div><div className="eyebrow">01 — THE BUILDER</div><h2>Tell your story.</h2><p>Fill in the details. Your live resume updates as you type.</p></div><button className="outline-btn" onClick={newResume}>＋ New resume</button></section>
      <div className="builder-grid"><section className="card editor-card"><div className="card-title"><div><span className="step-icon">✎</span><div><h3>Resume details</h3><p>Make every word count.</p></div></div><span className="live-pill"><i/> LIVE</span></div>
        <div className="template-picker"><label>CHOOSE A TEMPLATE</label><div className="template-options">{templates.map(t=><button key={t} className={template===t?"template active":"template"} onClick={()=>setTemplate(t)}><span className={`template-thumb ${t.toLowerCase()}`}><i/><i/><i/></span>{t}{template===t&&<b>✓</b>}</button>)}</div></div>
        <div className="fields">{fields.map(([key,label])=><label key={key} className={["summary","skills","education","experience","projects"].includes(key)?"wide":""}>{label}<textarea name={key} value={data[key]||""} onChange={update} rows={["summary","experience","projects"].includes(key)?3: key==="skills"?2:1} placeholder={({name:"e.g. Alex Morgan",role:"e.g. Product Designer",email:"you@example.com",phone:"+91 00000 00000",location:"City, Country",summary:"A short, compelling introduction…",skills:"Skills separated by commas",education:"Degree, institution, graduation year",experience:"Role, company, achievements",projects:"Project name, tools, impact"})[key]}/></label>)}</div>
        <div className="action-row"><button className="primary" onClick={saveResume} disabled={saving}>{saving?"Saving…":editingId?"✓ Update saved resume":"♡ Save resume"}</button><button className="outline-btn" onClick={download}>↓ Export PDF</button></div>
      </section>
      <section className="preview-column"><div className="preview-label"><span><i/> LIVE PREVIEW</span><span>A4 · {template.toUpperCase()}</span></div>
        <article id="resume-preview" className={`resume-preview ${template.toLowerCase()}`}><div className="resume-accent"/><div className="resume-inner"><h1>{data.name||"Your Name"}</h1><h3>{data.role||"Your Professional Title"}</h3><p className="contact">{[data.email,data.phone,data.location].filter(Boolean).join("  ·  ")||"Email · Phone · Location"}</p>
        <section><h4>PROFILE</h4><p>{data.summary||"Write a concise professional summary that highlights your strengths, experience, and the value you bring to a team."}</p></section>
        <section><h4>CORE SKILLS</h4><p className="resume-skills">{(data.skills||"Your key skills").split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).map(s=><span key={s}>{s}</span>)}</p></section>
        <section><h4>EXPERIENCE</h4><p className="preserve">{data.experience||"Add your recent role, responsibilities, and measurable achievements."}</p></section>
        <section><h4>SELECTED PROJECTS</h4><p className="preserve">{data.projects||"Showcase relevant projects and the technologies or skills you used."}</p></section>
        <section><h4>EDUCATION</h4><p className="preserve">{data.education||"Degree · Institution · Graduation year"}</p></section></div><div className="resume-bottom">RESUME / {data.name||"YOUR NAME"} <span>✦</span></div></article>
        <div className="preview-hint">✦ <span>Tip: tailor your summary and skills to each role you apply for.</span></div>
      </section></div>
      <section id="analyzer" className="analyzer-section"><div className="analyzer-intro"><div className="eyebrow">02 — THE ADVANTAGE</div><h2>Get past the bots.<br/><em>Get noticed by people.</em></h2><p>Check how closely your resume matches a job description. Get a keyword breakdown and practical suggestions before you apply.</p><div className="analyzer-benefit"><span>✳</span><div><b>Keyword matching</b><small>Spot important skills you may be missing.</small></div></div><div className="analyzer-benefit"><span>↗</span><div><b>Actionable feedback</b><small>Improve your resume with focused edits.</small></div></div></div>
        <div className="card analyzer-card"><div className="card-title"><div><span className="step-icon purple">⌕</span><div><h3>ATS compatibility check</h3><p>Compare your resume with a target role.</p></div></div><span className="beta-pill">SMART ANALYSIS</span></div><label className="job-label">JOB DESCRIPTION<textarea value={job} onChange={e=>setJob(e.target.value)} rows={7} placeholder="Paste the job description here… Include responsibilities, required skills, and qualifications."/></label><button className="primary analyze-btn" onClick={analyze} disabled={loading}>{loading?"Analyzing resume…":"✦  Analyze my resume  →"}</button>
        {analysis&&<div className="analysis-result"><div className="score-row"><div className="score-circle" style={{"--score":`${analysis.score||0}%`}}><div><b>{analysis.score??0}%</b><small>MATCH SCORE</small></div></div><div><h4>{(analysis.score||0)>=80?"Strong match":(analysis.score||0)>=55?"Good foundation":"Room to improve"}</h4><p>Based on keywords and resume sections.</p></div></div><div className="match-columns"><div><b className="green">✓ Matched ({(analysis.matched||[]).length})</b><p>{(analysis.matched||[]).join(" · ")||"No matched keywords yet"}</p></div><div><b className="red">＋ Missing ({(analysis.missing||[]).length})</b><p>{(analysis.missing||[]).join(" · ")||"No missing keywords found"}</p></div></div><h4>Suggestions to improve</h4><ul>{(analysis.suggestions||[]).map((s,i)=><li key={i}>{s}</li>)}</ul></div>}
        </div></section>
      <section id="library" className="library-section"><div className="section-heading"><div><div className="eyebrow">03 — YOUR COLLECTION</div><h2>Your resume library.</h2><p>All your versions, organized and ready when opportunity knocks.</p></div><button className="outline-btn" onClick={()=>loadSavedResumes()}>↻ Refresh</button></div>
        <div className="card library-card"><div className="library-toolbar"><div><b>{savedResumes.length} <span>saved {savedResumes.length===1?"resume":"resumes"}</span></b></div><div className="search-box">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, role, email…"/></div></div>
        {filtered.length===0?<div className="empty-state"><div>▤</div><h3>{search?"No matching resumes":"Your library is waiting."}</h3><p>{search?"Try a different search term.":"Save your first resume to keep it safe and easy to find."}</p><button className="outline-btn" onClick={newResume}>＋ Create a resume</button></div>:<div className="library-list">{filtered.map(item=><div className="library-item" key={item._id}><div className="file-icon">CV</div><div className="library-info"><b>{item.resume?.name||"Untitled resume"}</b><span>{item.resume?.role||"Professional"} · {item.resume?.email||"No email"}</span><small>Updated {new Date(item.updatedAt||item.createdAt).toLocaleDateString()}</small></div>{item.analysis?.score!==undefined&&<div className="mini-score">{item.analysis.score}% <small>ATS</small></div>}<div className="library-actions"><button onClick={()=>useSavedResume(item)} className="small-btn">Edit ↗</button><button onClick={()=>deleteResume(item._id)} className="small-btn delete-btn" aria-label="Delete resume">Delete</button></div></div>)}</div>}</div>
      </section>
      {message&&<div className="toast" role="status"><span>✦</span>{message}<button onClick={()=>setMessage("")}>×</button></div>}
    </main><footer><div className="brand"><div className="brand-icon">✦</div><div><b>Resumint</b><small>CAREER STUDIO</small></div></div><span>Make your next move count.</span><span>BUILT FOR WHAT'S NEXT ↗</span></footer>
  </div>;
}
