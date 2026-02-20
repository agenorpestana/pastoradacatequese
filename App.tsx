
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { RegistrationForm } from './components/RegistrationForm';
import { StudentTable } from './components/StudentTable';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { ClassForm } from './components/ClassForm';
import { ClassTable } from './components/ClassTable';
import { ClassMembersModal } from './components/ClassMembersModal';
import { ClassAttendanceModal } from './components/ClassAttendanceModal';
import { ClassHistoryModal } from './components/ClassHistoryModal';
import { CatequistaForm } from './components/CatequistaForm';
import { CatequistaTable } from './components/CatequistaTable';
import { CatequistaHistoryModal } from './components/CatequistaHistoryModal';
import { FormationForm } from './components/FormationForm';
import { FormationTable } from './components/FormationTable';
import { FormationAttendanceModal } from './components/FormationAttendanceModal';
import { EventFormModal } from './components/EventFormModal';
import { ParishEventAttendanceModal } from './components/ParishEventAttendanceModal';
import { Reports } from './components/Reports';
import { AttendanceReport } from './components/AttendanceReport';
import { CertificateGenerator } from './components/CertificateGenerator';
import { ProfileForm } from './components/ProfileForm';
import { UserList, UserForm } from './components/UserManagement';
import { GalleryView } from './components/GalleryView';
import { LibraryView } from './components/LibraryView';
import { ConfigForm } from './components/ConfigForm';
import { StudentDocumentsModal } from './components/StudentDocumentsModal';
import { CalendarView } from './components/CalendarView';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { api } from './services/api';
import { 
  AppView, User, Student, Turma, Catequista, FormationEvent, 
  ParishEvent, GalleryImage, LibraryFile, AttendanceSession, 
  ParishConfig, StudentDocument
} from './types';
import { 
  LayoutDashboard, CheckCircle2, Loader2, ClipboardList, BookOpen, 
  UsersRound, Droplets, Wine, Flame, Sparkles, CalendarDays, Clock 
} from 'lucide-react';

// DashboardContent Component
const DashboardContent = ({ events, students, classes, catequistas, suggestedDate, onDateChange, onAddEvent, user, onTakeEventAttendance }: any) => {
    // Eventos do dia selecionado
    const selectedDayEvents = events.filter((e: any) => e.dataInicio === suggestedDate);
    const dateObj = new Date(suggestedDate + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    
    // Eventos Futuros (A partir de hoje)
    const today = new Date().toISOString().split('T')[0];
    const futureEvents = events
        .filter((e: any) => e.dataInicio >= today)
        .sort((a: any, b: any) => {
            const dateA = new Date(a.dataInicio + 'T' + (a.horarioInicio || '00:00'));
            const dateB = new Date(b.dataInicio + 'T' + (b.horarioInicio || '00:00'));
            return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 10); // Limitar aos próximos 10 eventos

    // Statistics Calculations
    const totalStudents = students.length;
    const activeStudents = students.filter((s:any) => s.status === 'Ativo');
    const inactiveStudentsCount = students.filter((s:any) => s.status === 'Inativo').length;
    const concludedStudentsCount = students.filter((s:any) => s.status === 'Concluido').length;

    const totalClasses = classes.length;
    
    const totalCatequistas = catequistas.length;
    const activeCatequistasCount = catequistas.filter((c:any) => c.status === 'Ativo').length;
    const inactiveCatequistasCount = totalCatequistas - activeCatequistasCount;

    const activeBatizadosCount = activeStudents.filter((s:any) => s.batizado).length;
    const activeSemBatismoCount = activeStudents.length - activeBatizadosCount;

    const activeEucaristiaCount = activeStudents.filter((s:any) => s.fezPrimeiraEucaristia).length;
    const activeSemEucaristiaCount = activeStudents.length - activeEucaristiaCount;

    // Logic for Crisma preparation stats
    const crismaLevels = ['Crisma 1ª Etapa', 'Crisma 2ª Etapa', 'Catecumenato', 'Catequese de Adultos'];
    const crismaClasses = classes.filter((c:any) => crismaLevels.some((l: string) => (c.nivel || '').includes(l) || c.nivel === l));
    const crismaClassNames = crismaClasses.map((c:any) => c.nome);
    const studentsInCrismaPrep = activeStudents.filter((s:any) => crismaClassNames.includes(s.turma)).length;

    return (
      <div className="space-y-10 pb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-100 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <LayoutDashboard className="text-white w-8 h-8 relative z-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Painel Pastoral</h2>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                Bem-vindo(a), <span className="text-blue-600 font-black">{user?.nome}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
           {/* 1. TOTAL CATEQUIZANDOS */}
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg h-48">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Catequizandos</p>
                 <h3 className="text-4xl font-black text-slate-800">{totalStudents}</h3>
               </div>
               <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <ClipboardList className="w-6 h-6" />
               </div>
             </div>
             <div className="flex gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-wide">
               <span className="text-green-600">Ativos: {activeStudents.length}</span>
               <span className="text-red-400">Inativos: {inactiveStudentsCount}</span>
               <span className="text-indigo-400">Crismados: {concludedStudentsCount}</span>
             </div>
           </div>

           {/* 2. TOTAL DE TURMAS */}
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg h-48">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Turmas</p>
                 <h3 className="text-4xl font-black text-slate-800">{totalClasses}</h3>
               </div>
               <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <BookOpen className="w-6 h-6" />
               </div>
             </div>
             <div className="pt-4 border-t border-slate-50">
               <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Grupos de Oração
               </p>
             </div>
           </div>

           {/* 3. CATEQUISTAS */}
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg h-48">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catequistas</p>
                 <h3 className="text-4xl font-black text-slate-800">{totalCatequistas}</h3>
               </div>
               <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                  <UsersRound className="w-6 h-6" />
               </div>
             </div>
             <div className="flex gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-wide">
               <span className="text-green-600">Ativos: {activeCatequistasCount}</span>
               <span className="text-slate-400">Inativos: {inactiveCatequistasCount}</span>
             </div>
           </div>

           {/* 4. SACR. DO BATISMO */}
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg h-48">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sacr. do Batismo (Ativos)</p>
                 <h3 className="text-4xl font-black text-slate-800">{activeBatizadosCount}</h3>
               </div>
               <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600">
                  <Droplets className="w-6 h-6" />
               </div>
             </div>
             <div className="flex gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-wide">
               <span className="text-cyan-600">Batizados: {activeBatizadosCount}</span>
               <span className="text-slate-400">Sem Batizar: {activeSemBatismoCount}</span>
             </div>
           </div>

           {/* 5. SACR. DA EUCARISTIA */}
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg h-48">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sacr. da Eucaristia (Ativos)</p>
                 <h3 className="text-4xl font-black text-slate-800">{activeEucaristiaCount}</h3>
               </div>
               <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                  <Wine className="w-6 h-6" />
               </div>
             </div>
             <div className="flex gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-wide">
               <span className="text-amber-600">Com Eucaristia: {activeEucaristiaCount}</span>
               <span className="text-slate-400">Sem Eucaristia: {activeSemEucaristiaCount}</span>
             </div>
           </div>

           {/* 6. SACR. DA CRISMA */}
           <div className="bg-sky-600 p-7 rounded-[2rem] shadow-xl shadow-sky-100 flex flex-col justify-between h-48 relative overflow-hidden group hover:shadow-2xl transition-all text-white">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                <Flame className="w-32 h-32 text-white" />
             </div>
             <div className="flex justify-between items-start z-10">
               <div>
                 <p className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-1">Sacr. da Crisma</p>
                 <h3 className="text-4xl font-black">{concludedStudentsCount}</h3>
               </div>
               <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Flame className="w-6 h-6 text-white" />
               </div>
             </div>
             <div className="flex gap-4 pt-4 border-t border-white/20 z-10 text-[9px] font-black uppercase tracking-wide opacity-90">
               <span>Total de Turmas: {crismaClasses.length}</span>
               <span>Em Preparação: {studentsInCrismaPrep}</span>
             </div>
           </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           {/* Coluna Esquerda: Calendário + Eventos do Dia */}
           <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="h-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                 <CalendarView events={events} selectedDate={suggestedDate} onDateChange={onDateChange} onAddEvent={onAddEvent} />
              </div>
              
              {/* Eventos do Dia Selecionado */}
              <div className="bg-white rounded-[2rem] border border-blue-100 p-6 shadow-sm flex-1 min-h-[250px] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5"><CalendarDays className="w-24 h-24 text-blue-600" /></div>
                 <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Eventos do Dia <span className="text-slate-400">({dayName})</span>
                 </h4>
                 <div className="space-y-3 relative z-10">
                     {selectedDayEvents.length > 0 ? selectedDayEvents.map((event: any) => (
                         <div key={event.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-blue-50/50 transition-colors">
                             <p className="font-bold text-slate-800 text-sm leading-tight">{event.titulo}</p>
                             <div className="flex justify-between items-center mt-2">
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1">
                                     <Clock className="w-3 h-3" /> {event.horarioInicio}
                                 </p>
                                 <button onClick={() => onTakeEventAttendance(event)} className="p-1.5 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors" title="Lançar Presença">
                                     <CheckCircle2 className="w-3 h-3" />
                                 </button>
                             </div>
                         </div>
                     )) : (
                         <div className="text-center py-10 text-slate-400">
                             <p className="text-xs italic">Nenhum evento para este dia.</p>
                             <button onClick={() => onAddEvent(suggestedDate)} className="mt-2 text-[10px] font-bold text-blue-600 hover:underline">Agendar Agora</button>
                         </div>
                     )}
                 </div>
              </div>
           </div>

           {/* Coluna Direita: Eventos Futuros */}
           <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-xl"><CalendarDays className="w-5 h-5 text-amber-600" /></div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Eventos Futuros</h4>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {futureEvents.length > 0 ? futureEvents.map((event: any) => {
                       const eventDate = new Date(event.dataInicio + 'T00:00:00');
                       const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
                       const day = eventDate.getDate();
                       
                       return (
                          <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 transition-all group">
                              <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl shrink-0 group-hover:bg-white group-hover:shadow-md transition-all border border-slate-200">
                                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none">{month}</span>
                                  <span className="text-xl font-black text-slate-800 leading-none mt-0.5">{day}</span>
                              </div>
                              <div className="flex-1">
                                  <h5 className="font-bold text-slate-800 text-sm">{event.titulo}</h5>
                                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.horarioInicio}</span>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                      <span>{event.local}</span>
                                  </p>
                              </div>
                              <div className="text-right">
                                   <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-white border border-slate-100 text-slate-500 uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                      {event.tipo}
                                   </span>
                              </div>
                          </div>
                       );
                  }) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest opacity-50">Sem eventos futuros agendados</p>
                      </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    );
};

// App Component
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  
  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Turma[]>([]);
  const [catequistas, setCatequistas] = useState<Catequista[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [formations, setFormations] = useState<FormationEvent[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [parishConfig, setParishConfig] = useState<ParishConfig>({
    pastoralName: 'Pastoral da Catequese',
    parishName: 'Paróquia',
    dioceseName: 'Diocese',
    address: '',
    city: '',
    state: '',
    phone: '',
    whatsapp: '',
    email: '',
  });

  // Modal/Editing States
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [managingDocumentsStudent, setManagingDocumentsStudent] = useState<Student | null>(null);
  
  const [editingClass, setEditingClass] = useState<Turma | null>(null);
  const [viewingClassMembers, setViewingClassMembers] = useState<Turma | null>(null);
  const [takingAttendanceClass, setTakingAttendanceClass] = useState<Turma | null>(null);
  const [viewingClassHistory, setViewingClassHistory] = useState<Turma | null>(null);
  
  const [editingCatequista, setEditingCatequista] = useState<Catequista | null>(null);
  const [viewingCatequistaHistory, setViewingCatequistaHistory] = useState<Catequista | null>(null);
  
  const [editingFormation, setEditingFormation] = useState<FormationEvent | null>(null);
  const [takingFormationAttendance, setTakingFormationAttendance] = useState<FormationEvent | null>(null);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [addingEventDate, setAddingEventDate] = useState<string | null>(null);
  const [takingEventAttendance, setTakingEventAttendance] = useState<ParishEvent | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Check Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      const storedSession = sessionStorage.getItem('catequese_auth_session');
      if (storedSession) {
        try {
          // Buscamos os usuários para validar a sessão e recuperar permissões
          const allUsers = await api.get('users');
          const found = allUsers.find((u: User) => u.email === storedSession || u.nome === storedSession);
          if (found) {
            setUser(found);
          }
        } catch (e) {
          console.error("Falha ao restaurar sessão:", e);
        }
      }
      setIsLoadingAuth(false);
    };
    checkSession();
  }, []);

  // Initial Data Fetch
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [s, c, cat, u, e, f, att, gal, lib, conf] = await Promise.all([
        api.get('students'),
        api.get('turmas'),
        api.get('catequistas'),
        api.get('users'),
        api.get('events'),
        api.get('formations'),
        api.get('attendance_sessions'),
        api.get('gallery'),
        api.get('library'),
        api.get('parish_config')
      ]);
      setStudents(s);
      setClasses(c);
      setCatequistas(cat);
      setUsers(u);
      setEvents(e);
      setFormations(f);
      setAttendanceSessions(att);
      setGalleryImages(gal);
      setLibraryFiles(lib);
      if (conf && conf.pastoralName) setParishConfig(conf);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onLoginSubmit = async (u: string, p: string) => {
     try {
       const allUsers = await api.get('users');
       const found = allUsers.find((user: User) => (user.email === u || user.nome === u) && user.senha === p);
       if (found) {
         setUser(found);
         sessionStorage.setItem('catequese_auth_session', u); // Salvar sessão
         return true;
       }
       return false;
     } catch (e) {
       console.error(e);
       return false;
     }
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
    sessionStorage.removeItem('catequese_auth_session'); // Limpar sessão
  };

  // --- CRUD Handlers ---

  // Students
  const handleSaveStudent = async (student: Student) => {
    try {
      if (student.id && students.find(s => s.id === student.id)) {
        await api.put('students', student.id, student);
        setStudents(prev => prev.map(s => s.id === student.id ? student : s));
      } else {
        const res = await api.post('students', student);
        setStudents(prev => [...prev, { ...student, id: res.id }]);
      }
      setView('list');
      setEditingStudent(null);
    } catch (e) { alert(e); }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await api.delete('students', id);
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleUpdateDocuments = async (docs: StudentDocument[]) => {
    if (!managingDocumentsStudent) return;
    const updated = { ...managingDocumentsStudent, documentos: docs };
    await api.put('students', updated.id, updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    setManagingDocumentsStudent(updated);
  };

  // Classes
  const handleSaveClass = async (turma: Turma, studentIds: string[]) => {
    try {
      let classId = turma.id;
      if (classId && classes.find(c => c.id === classId)) {
        await api.put('turmas', classId, turma);
        setClasses(prev => prev.map(c => c.id === classId ? turma : c));
      } else {
        const res = await api.post('turmas', turma);
        classId = res.id;
        setClasses(prev => [...prev, { ...turma, id: classId }]);
      }

      const studentsInThisClass = students.filter(s => s.turma === turma.nome);
      const studentsToRemove = studentsInThisClass.filter(s => !studentIds.includes(s.id));
      const studentsToAdd = students.filter(s => studentIds.includes(s.id));

      for (const s of studentsToRemove) {
        await api.put('students', s.id, { ...s, turma: '' });
      }
      for (const s of studentsToAdd) {
        if (s.turma !== turma.nome) {
           await api.put('students', s.id, { ...s, turma: turma.nome });
        }
      }
      
      const updatedStudents = await api.get('students');
      setStudents(updatedStudents);

      setView('classes_list');
      setEditingClass(null);
    } catch (e) { alert(e); }
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await api.delete('turmas', id);
      setClasses(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveAttendance = async (session: AttendanceSession) => {
    try {
      if (attendanceSessions.find(s => s.id === session.id)) {
        await api.put('attendance_sessions', session.id, session);
        setAttendanceSessions(prev => prev.map(s => s.id === session.id ? session : s));
      } else {
        await api.post('attendance_sessions', session);
        setAttendanceSessions(prev => [...prev, session]);
      }
      setTakingAttendanceClass(null);
    } catch (e) { alert(e); }
  };

  // Catequistas
  const handleSaveCatequista = async (catequista: Catequista) => {
    try {
      if (catequista.id && catequistas.find(c => c.id === catequista.id)) {
        await api.put('catequistas', catequista.id, catequista);
        setCatequistas(prev => prev.map(c => c.id === catequista.id ? catequista : c));
      } else {
        const res = await api.post('catequistas', catequista);
        setCatequistas(prev => [...prev, { ...catequista, id: res.id }]);
      }
      setView('catequista_list');
      setEditingCatequista(null);
    } catch (e) { alert(e); }
  };

  const handleDeleteCatequista = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await api.delete('catequistas', id);
      setCatequistas(prev => prev.filter(c => c.id !== id));
    }
  };

  // Formations
  const handleSaveFormation = async (formation: FormationEvent) => {
     try {
       if (formation.id && formations.find(f => f.id === formation.id)) {
         await api.put('formations', formation.id, formation);
         setFormations(prev => prev.map(f => f.id === formation.id ? formation : f));
       } else {
         const res = await api.post('formations', formation);
         setFormations(prev => [...prev, { ...formation, id: res.id }]);
       }
       setView('formation_list');
       setEditingFormation(null);
     } catch (e) { alert(e); }
  };
  
  const handleDeleteFormation = async (id: string) => {
     if (confirm('Tem certeza?')) {
       await api.delete('formations', id);
       setFormations(prev => prev.filter(f => f.id !== id));
     }
  };

  const handleSaveFormationAttendance = async (id: string, presentIds: string[]) => {
     const formation = formations.find(f => f.id === id);
     if (formation) {
       const updated = { ...formation, presentes: presentIds };
       await api.put('formations', id, updated);
       setFormations(prev => prev.map(f => f.id === id ? updated : f));
       setTakingFormationAttendance(null);
     }
  };

  // Events
  const handleAddEvent = (date?: string) => {
    setAddingEventDate(date || new Date().toISOString().split('T')[0]);
  };

  const handleSaveEvent = async (event: ParishEvent) => {
    try {
      const res = await api.post('events', event);
      setEvents(prev => [...prev, { ...event, id: res.id }]);
      setAddingEventDate(null);
    } catch (e) { alert(e); }
  };
  
  const handleSaveEventAttendance = async (eventId: string, presentIds: string[]) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const updated = { ...event, presentes: presentIds };
      await api.put('events', eventId, updated);
      setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
      setTakingEventAttendance(null);
    }
  };

  // Gallery
  const handleUploadImage = async (img: GalleryImage) => {
     try {
       const res = await api.post('gallery', img);
       setGalleryImages(prev => [...prev, { ...img, id: res.id }]);
     } catch (e) { alert(e); }
  };

  const handleEditImage = async (img: GalleryImage) => {
      try {
        await api.put('gallery', img.id, img);
        setGalleryImages(prev => prev.map(i => i.id === img.id ? img : i));
      } catch (e) { alert(e); }
  };

  const handleDeleteImage = async (id: string) => {
     if (confirm('Excluir imagem?')) {
       await api.delete('gallery', id);
       setGalleryImages(prev => prev.filter(i => i.id !== id));
     }
  };
  
  const handleDeleteMultipleImages = async (ids: string[]) => {
     if (confirm(`Excluir ${ids.length} imagens?`)) {
       for (const id of ids) {
         await api.delete('gallery', id);
       }
       setGalleryImages(prev => prev.filter(i => !ids.includes(i.id)));
     }
  };

  // Library
  const handleUploadFile = async (file: LibraryFile) => {
    try {
      const res = await api.post('library', file);
      setLibraryFiles(prev => [...prev, { ...file, id: res.id }]);
    } catch (e) { alert(e); }
  };

  const handleDeleteFile = async (id: string) => {
    if (confirm('Excluir arquivo?')) {
      await api.delete('library', id);
      setLibraryFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  // Users
  const handleSaveUser = async (u: User) => {
    try {
      if (u.id && users.find(us => us.id === u.id)) {
        await api.put('users', u.id, u);
        setUsers(prev => prev.map(us => us.id === u.id ? u : us));
      } else {
        const res = await api.post('users', u);
        setUsers(prev => [...prev, { ...u, id: res.id }]);
      }
      setView('users_list');
      setEditingUser(null);
    } catch (e) { alert(e); }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await api.delete('users', id);
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };
  
  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await api.put('users', user.id, updated);
    setUser(updated);
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
  };

  // Config
  const handleSaveConfig = async (cfg: ParishConfig) => {
    try {
      await api.saveConfig(cfg);
      setParishConfig(cfg);
    } catch (e) { alert(e); }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-blue-600"><Loader2 className="w-10 h-10" /></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login onLogin={async (u, p) => await onLoginSubmit(u, p)} />
        <PwaInstallPrompt />
      </>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardContent 
                  events={events} 
                  students={students} 
                  classes={classes} 
                  catequistas={catequistas}
                  suggestedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onAddEvent={handleAddEvent}
                  user={user}
                  onTakeEventAttendance={setTakingEventAttendance}
               />;
      case 'register':
        return <RegistrationForm 
                  onSave={handleSaveStudent} 
                  onCancel={() => { setView('list'); setEditingStudent(null); }} 
                  initialData={editingStudent}
                  allClasses={classes}
                  config={parishConfig}
               />;
      case 'list':
        return <StudentTable 
                  students={students}
                  allClasses={classes}
                  onDelete={user.permissions.students_delete ? handleDeleteStudent : () => alert('Sem permissão')}
                  onEdit={user.permissions.students_edit ? (s) => { setEditingStudent(s); setView('register'); } : () => alert('Sem permissão')}
                  onView={(s) => setViewingStudent(s)}
                  onManageDocuments={(s) => setManagingDocumentsStudent(s)}
                  onAddNew={user.permissions.students_create ? () => { setEditingStudent(null); setView('register'); } : undefined}
               />;
      case 'classes_list':
        return <ClassTable 
                  classes={classes}
                  onDelete={handleDeleteClass}
                  onEdit={(c) => { setEditingClass(c); setView('classes_create'); }}
                  onViewMembers={(c) => setViewingClassMembers(c)}
                  onTakeAttendance={(c) => setTakingAttendanceClass(c)}
                  onViewHistory={(c) => setViewingClassHistory(c)}
                  onAddNew={user.permissions.classes ? () => { setEditingClass(null); setView('classes_create'); } : undefined}
               />;
      case 'classes_create':
        return <ClassForm 
                  onSave={handleSaveClass} 
                  onCancel={() => setView('classes_list')} 
                  initialData={editingClass || undefined}
                  allStudents={students}
                  catequistas={catequistas}
               />;
      case 'catequista_list':
        return <CatequistaTable 
                  catequistas={catequistas}
                  onDelete={handleDeleteCatequista}
                  onEdit={(c) => { setEditingCatequista(c); setView('catequista_create'); }}
                  onViewHistory={(c) => setViewingCatequistaHistory(c)}
                  onAddNew={user.permissions.catequistas ? () => { setEditingCatequista(null); setView('catequista_create'); } : undefined}
               />;
      case 'catequista_create':
        return <CatequistaForm 
                  onSave={handleSaveCatequista}
                  onCancel={() => setView('catequista_list')}
                  initialData={editingCatequista || undefined}
               />;
      case 'formation_list': 
        return <FormationTable 
                  formations={formations}
                  onDelete={handleDeleteFormation}
                  onEdit={(f) => { setEditingFormation(f); setView('formation_create'); }}
                  onAttendance={(f) => setTakingFormationAttendance(f)}
               />;
      case 'formation_create':
        return <FormationForm 
                  onSave={handleSaveFormation}
                  onCancel={() => setView('dashboard')} 
                  initialData={editingFormation || undefined}
               />;
      case 'reports':
        return <Reports students={students} classes={classes} attendanceSessions={attendanceSessions} />;
      case 'attendance_report':
        return <AttendanceReport classes={classes} attendanceSessions={attendanceSessions} catequistas={catequistas} config={parishConfig} students={students} />;
      case 'certificates':
        return <CertificateGenerator students={students} config={parishConfig} />;
      case 'profile':
        return <ProfileForm currentUser={user} onSave={handleUpdateProfile} onCancel={() => setView('dashboard')} />;
      case 'users_list':
        return <UserList 
                  users={users} 
                  onEdit={(u) => { setEditingUser(u); setView('users_create'); }}
                  onDelete={handleDeleteUser}
                  onCreateNew={() => { setEditingUser(null); setView('users_create'); }}
                  currentUser={user}
               />;
      case 'users_create':
        return <UserForm 
                  onSave={handleSaveUser}
                  onCancel={() => setView('users_list')}
                  initialData={editingUser || undefined}
                  availableClasses={classes}
                  catequistas={catequistas}
               />;
      case 'gallery':
        return <GalleryView 
                  images={galleryImages}
                  onUpload={handleUploadImage}
                  onEdit={handleEditImage}
                  onDelete={handleDeleteImage}
                  onDeleteMultiple={handleDeleteMultipleImages}
                  canUpload={user.permissions.gallery_upload}
                  canDelete={user.permissions.gallery_delete}
                  availableClasses={classes}
               />;
      case 'library':
        return <LibraryView 
                  files={libraryFiles}
                  onUpload={handleUploadFile}
                  onDelete={handleDeleteFile}
                  canUpload={user.permissions.library_upload}
                  canDelete={user.permissions.library_delete}
               />;
      case 'config':
        return <ConfigForm config={parishConfig} onSave={handleSaveConfig} />;
      default:
        return <DashboardContent 
                  events={events} 
                  students={students} 
                  classes={classes} 
                  catequistas={catequistas}
                  suggestedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onAddEvent={handleAddEvent}
                  user={user}
                  onTakeEventAttendance={setTakingEventAttendance}
               />;
    }
  };

  return (
    <>
      <Layout currentView={view} setView={setView} currentUser={user} onLogout={handleLogout} parishConfig={parishConfig}>
        {renderContent()}

        {/* Modals */}
        {viewingStudent && (
          <StudentDetailsModal 
            student={viewingStudent} 
            attendanceSessions={attendanceSessions} 
            classes={classes} 
            onClose={() => setViewingStudent(null)} 
            config={parishConfig}
          />
        )}

        {managingDocumentsStudent && (
          <StudentDocumentsModal 
            student={managingDocumentsStudent}
            onClose={() => setManagingDocumentsStudent(null)}
            onUpdateDocuments={handleUpdateDocuments}
          />
        )}

        {viewingClassMembers && (
          <ClassMembersModal 
            turma={viewingClassMembers}
            members={students.filter(s => s.turma === viewingClassMembers.nome)}
            onClose={() => setViewingClassMembers(null)}
            onViewStudent={(s) => { setViewingClassMembers(null); setViewingStudent(s); }}
          />
        )}

        {takingAttendanceClass && (
          <ClassAttendanceModal 
            turma={takingAttendanceClass}
            members={students.filter(s => s.turma === takingAttendanceClass.nome)}
            onClose={() => setTakingAttendanceClass(null)}
            onSave={handleSaveAttendance}
            existingSessions={attendanceSessions}
          />
        )}

        {viewingClassHistory && (
          <ClassHistoryModal 
            turma={viewingClassHistory}
            sessions={attendanceSessions}
            members={students.filter(s => s.turma === viewingClassHistory.nome)}
            onClose={() => setViewingClassHistory(null)}
            config={parishConfig}
          />
        )}

        {takingFormationAttendance && (
          <FormationAttendanceModal 
            formation={takingFormationAttendance}
            catequistas={catequistas}
            onClose={() => setTakingFormationAttendance(null)}
            onSave={handleSaveFormationAttendance}
          />
        )}

        {viewingCatequistaHistory && (
          <CatequistaHistoryModal 
            catequista={viewingCatequistaHistory}
            formations={formations}
            parishEvents={events}
            onClose={() => setViewingCatequistaHistory(null)}
          />
        )}

        {addingEventDate && (
          <EventFormModal 
            onSave={handleSaveEvent}
            onClose={() => setAddingEventDate(null)}
            initialDate={addingEventDate}
          />
        )}

        {takingEventAttendance && (
          <ParishEventAttendanceModal 
            event={takingEventAttendance}
            catequistas={catequistas}
            onClose={() => setTakingEventAttendance(null)}
            onSave={handleSaveEventAttendance}
          />
        )}
      </Layout>
      <PwaInstallPrompt />
    </>
  );
};

export default App;
