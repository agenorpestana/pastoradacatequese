
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { RegistrationForm } from './components/RegistrationForm';
import { StudentTable } from './components/StudentTable';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { StudentDocumentsModal } from './components/StudentDocumentsModal';
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
import { ParishEventAttendanceModal } from './components/ParishEventAttendanceModal';
import { Reports } from './components/Reports';
import { AttendanceReport } from './components/AttendanceReport';
import { CertificateGenerator } from './components/CertificateGenerator';
import { ProfileForm } from './components/ProfileForm';
import { UserList, UserForm } from './components/UserManagement';
import { ConfigForm } from './components/ConfigForm';
import { EventFormModal } from './components/EventFormModal';
import { CalendarView } from './components/CalendarView';
import { GalleryView } from './components/GalleryView';
import { LibraryView } from './components/LibraryView';
import { AppView, Student, Turma, AttendanceSession, Catequista, ParishEvent, FormationEvent, User, GalleryImage, StudentDocument, LibraryFile, ParishConfig, TurmaLevel, UserPermissions } from './types';
import { 
  ClipboardList, 
  BookOpen, 
  Plus, 
  UsersRound, 
  Flame, 
  Clock, 
  CalendarDays,
  Image as ImageIcon,
  MapPin,
  CheckCircle2,
  Waves,
  Wine,
  UserX,
  Droplets,
  ShieldCheck,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from './services/api';

const defaultPermissions: UserPermissions = {
  dashboard: true, students_view: false, students_create: false, students_edit: false,
  students_delete: false, students_print: false, students_confirmed_view: false, students_confirmed_manage: false,
  classes: false, catequistas: false, 
  formations: false, reports: false, attendance_report: false, certificates: false, attendance: false, users_management: false,
  library_view: false, library_upload: false, library_delete: false,
  gallery_view: false, gallery_upload: false, gallery_delete: false,
  allowedClassIds: []
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setView] = useState<AppView>('dashboard');
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Configuração Global
  const [parishConfig, setParishConfig] = useState<ParishConfig>({
    pastoralName: 'Pastoral da Catequese',
    parishName: 'Paróquia Nossa Senhora de Fátima',
    dioceseName: 'Diocese de Teixeira de Freitas-Caravelas',
    address: 'Av. Brasil, 123',
    city: 'Itamaraju',
    state: 'BA',
    phone: '(73) 3294-0000',
    whatsapp: '(73) 98888-0000',
    email: 'contato@paroquiaitamaraju.com.br'
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Turma[]>([]);
  const [catequistas, setCatequistas] = useState<Catequista[]>([]);
  const [formations, setFormations] = useState<FormationEvent[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [library, setLibrary] = useState<LibraryFile[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [managingDocuments, setManagingDocuments] = useState<Student | null>(null);
  const [editingClass, setEditingClass] = useState<Turma | null>(null);
  const [editingCatequista, setEditingCatequista] = useState<Catequista | null>(null);
  const [viewingCatequistaHistory, setViewingCatequistaHistory] = useState<Catequista | null>(null);
  const [editingFormation, setEditingFormation] = useState<FormationEvent | null>(null);
  const [takingFormationAttendance, setTakingFormationAttendance] = useState<FormationEvent | null>(null);
  const [takingEventAttendance, setTakingEventAttendance] = useState<ParishEvent | null>(null);
  const [viewingClassMembers, setViewingClassMembers] = useState<Turma | null>(null);
  const [takingAttendance, setTakingAttendance] = useState<Turma | null>(null);
  const [viewingClassHistory, setViewingClassHistory] = useState<Turma | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Carregar dados iniciais da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          fetchedUsers, 
          fetchedStudents, 
          fetchedClasses, 
          fetchedCatequistas, 
          fetchedFormations, 
          fetchedAttendance, 
          fetchedEvents, 
          fetchedGallery, 
          fetchedLibrary,
          fetchedConfig
        ] = await Promise.all([
          api.get('users'),
          api.get('students'),
          api.get('turmas'),
          api.get('catequistas'),
          api.get('formations'), 
          api.get('attendance_sessions'),
          api.get('events'),
          api.get('gallery'),
          api.get('library'),
          api.get('parish_config')
        ]);

        setUsers(fetchedUsers);
        setStudents(fetchedStudents);
        setClasses(fetchedClasses);
        setCatequistas(fetchedCatequistas);
        if (Array.isArray(fetchedFormations)) setFormations(fetchedFormations); else setFormations([]);
        setAttendanceSessions(fetchedAttendance);
        setEvents(fetchedEvents);
        setGallery(fetchedGallery);
        setLibrary(fetchedLibrary);
        if (fetchedConfig && Object.keys(fetchedConfig).length > 0) setParishConfig(fetchedConfig);

        // Check Session
        const sessionEmailOrName = sessionStorage.getItem('catequese_auth_session');
        if (sessionEmailOrName) {
          const found = fetchedUsers.find((u: User) => u.email === sessionEmailOrName || u.nome === sessionEmailOrName);
          if (found) { setCurrentUser(found); setIsAuthenticated(true); }
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // FILTRAGEM POR PERMISSÃO DE TURMA (Automática por Catequista Vinculado ou Manual)
  const filteredClasses = useMemo(() => {
    if (!currentUser || currentUser.role === 'coordenador_paroquial') return classes;

    // 1. Verificação Automática por Catequista Vinculado
    if (currentUser.linkedCatequistaId) {
      const linkedProfile = catequistas.find(c => c.id === currentUser.linkedCatequistaId);
      if (linkedProfile) {
        // Filtra turmas onde o nome do catequista aparece no campo 'catequista' da turma
        // Normaliza para lowercase para evitar problemas de case sensitive
        return classes.filter(c => 
          c.catequista && c.catequista.toLowerCase().includes(linkedProfile.nome.toLowerCase())
        );
      }
    }

    // 2. Verificação Manual por IDs permitidos (Fallback ou Adicional)
    const allowed = currentUser.permissions.allowedClassIds || [];
    if (allowed.length === 0) return classes; // Se não houver restrição explícita e nem catequista vinculado, mostra tudo? Normalmente sim, ou nada. Mantendo comportamento anterior.
    return classes.filter(c => allowed.includes(c.id));
  }, [classes, currentUser, catequistas]);

  // FILTRAGEM DA GALERIA POR PERMISSÃO DE TURMA
  const filteredGalleryByPermission = useMemo(() => {
    // Coordenadores veem tudo (incluindo fotos sem turma)
    if (!currentUser || currentUser.role === 'coordenador_paroquial' || currentUser.role === 'coordenador_comunidade') return gallery;

    // Catequistas e Auxiliares
    // Obtém os IDs das turmas permitidas para o usuário atual
    const allowedClassIds = filteredClasses.map(c => c.id);

    // Filtra a galeria:
    // 1. Fotos vinculadas a turmas permitidas -> MOSTRAR
    // 2. Fotos SEM turma vinculada (Gerais) -> OCULTAR (regra específica: "só vai aparecer para os demais perfis menos para os catequistas")
    return gallery.filter(img => img.turmaId && allowedClassIds.includes(img.turmaId));
  }, [gallery, filteredClasses, currentUser]);

  const filteredStudentsByPermission = useMemo(() => {
    if (!currentUser || currentUser.role === 'coordenador_paroquial') return students;
    
    let list = students;
    const p = { ...defaultPermissions, ...currentUser.permissions };
    if (!p.students_confirmed_view) {
      list = list.filter(s => s.status !== 'Concluido');
    }

    // Se tiver catequista vinculado, usa as turmas filtradas acima
    if (currentUser.linkedCatequistaId) {
       const allowedClassNames = filteredClasses.map(c => c.nome);
       return list.filter(s => !s.turma || allowedClassNames.includes(s.turma));
    }

    // Fallback para IDs manuais
    const allowed = p.allowedClassIds || [];
    if (allowed.length === 0) return list;
    
    const allowedClassNames = classes.filter(c => allowed.includes(c.id)).map(c => c.nome);
    return list.filter(s => !s.turma || allowedClassNames.includes(s.turma));
  }, [students, classes, currentUser, filteredClasses]);

  const handleLogin = (usernameOrEmail: string, pass: string) => {
    const found = users.find(u => (u.email === usernameOrEmail || u.nome === usernameOrEmail) && u.senha === pass);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      sessionStorage.setItem('catequese_auth_session', usernameOrEmail);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('catequese_auth_session');
    setView('dashboard');
  };

  const handleSaveProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    try {
      await api.put('users', currentUser.id, { ...currentUser, ...updatedData });
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (e) { alert('Erro ao salvar perfil'); }
  };

  const handleSaveUser = async (newUser: User) => {
    try {
      if (users.some(u => u.id === newUser.id)) {
        await api.put('users', newUser.id, newUser);
        setUsers(prev => prev.map(u => u.id === newUser.id ? newUser : u));
      } else {
        await api.post('users', newUser);
        setUsers(prev => [...prev, newUser]);
      }
      setEditingUser(null);
      setView('users_list');
    } catch (e) { alert('Erro ao salvar usuário'); }
  };

  const handleSaveEvent = async (newEvent: ParishEvent) => {
    try {
      await api.post('events', newEvent);
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()));
      setIsAddingEvent(false);
    } catch (e) { alert('Erro ao salvar evento'); }
  };

  const handleSaveEventAttendance = async (eventId: string, presentIds: string[]) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (event) {
        const updated = { ...event, presentes: presentIds };
        await api.put('events', eventId, updated);
        setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
      }
      setTakingEventAttendance(null);
    } catch (e) { alert('Erro ao salvar presença'); }
  };

  const handleSetView = (view: AppView) => {
    if (view === 'register') setEditingStudent(null);
    if (view === 'classes_create') setEditingClass(null);
    if (view === 'catequista_create') setEditingCatequista(null);
    if (view === 'formation_create') setEditingFormation(null);
    if (view === 'users_create') setEditingUser(null);
    setView(view);
  };

  const handleSaveStudent = async (newStudent: Student) => {
    try {
      const exists = students.find(s => s.id === newStudent.id);
      if (exists) {
        await api.put('students', newStudent.id, newStudent);
        setStudents(prev => prev.map(s => s.id === newStudent.id ? newStudent : s));
      } else {
        await api.post('students', newStudent);
        setStudents(prev => [...prev, newStudent]);
      }
      setEditingStudent(null);
      setView('list'); 
    } catch (e) { alert('Erro ao salvar catequizando'); }
  };

  const handleUpdateStudentDocuments = async (studentId: string, docs: StudentDocument[]) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (student) {
        const updated = { ...student, documentos: docs };
        await api.put('students', studentId, updated);
        setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
      }
    } catch (e) { alert('Erro ao salvar documentos'); }
  };

  const handleSaveClass = async (newTurma: Turma, studentIds: string[]) => {
    try {
      const exists = classes.find(t => t.id === newTurma.id);
      if (exists) {
        await api.put('turmas', newTurma.id, newTurma);
        setClasses(prev => prev.map(t => t.id === newTurma.id ? newTurma : t));
      } else {
        await api.post('turmas', newTurma);
        setClasses(prev => [...prev, newTurma]);
      }
      
      const promises = students.map(s => {
        let changed = false;
        let updatedStudent = { ...s };
        
        if (studentIds.includes(s.id) && s.turma !== newTurma.nome) {
          updatedStudent.turma = newTurma.nome;
          changed = true;
        } else if (!studentIds.includes(s.id) && s.turma === newTurma.nome) {
          updatedStudent.turma = '';
          changed = true;
        }

        if (changed) {
          return api.put('students', s.id, updatedStudent);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      setStudents(prev => prev.map(s => {
        if (studentIds.includes(s.id)) return { ...s, turma: newTurma.nome };
        if (s.turma === newTurma.nome && !studentIds.includes(s.id)) return { ...s, turma: '' };
        return s;
      }));

      setEditingClass(null);
      setView('classes_list');
    } catch (e) { alert('Erro ao salvar turma'); }
  };

  const handleSaveAttendance = async (session: AttendanceSession) => {
    try {
      const exists = attendanceSessions.find(s => s.id === session.id);
      if (exists) {
        await api.put('attendance_sessions', session.id, session);
      } else {
        await api.post('attendance_sessions', session);
      }

      setAttendanceSessions(prev => {
        const filtered = prev.filter(s => !(s.turmaId === session.turmaId && s.date === session.date));
        return [...filtered, session];
      });
      setTakingAttendance(null);
    } catch (e) { alert('Erro ao salvar chamada'); }
  };

  const handleUploadGallery = async (img: GalleryImage) => {
    try {
      await api.post('gallery', img);
      setGallery(prev => [img, ...prev]);
    } catch (e: any) { 
      console.error(e);
      if (e.message?.includes('413') || e.message?.includes('Too Large')) {
        alert('O arquivo é muito grande para o servidor. Tente reduzir o tamanho (máx 150MB).');
      } else {
        alert('Erro ao enviar imagem. Verifique o console para mais detalhes.');
      }
    }
  };

  const handleEditGallery = async (img: GalleryImage) => {
    try {
      await api.put('gallery', img.id, img);
      setGallery(prev => prev.map(i => i.id === img.id ? img : i));
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('413') || e.message?.includes('Too Large')) {
        alert('O arquivo é muito grande para o servidor. Tente reduzir o tamanho (máx 150MB).');
      } else {
        alert('Erro ao editar imagem.');
      }
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Deseja realmente excluir esta lembrança da galeria?')) {
      try {
        await api.delete('gallery', id);
        setGallery(prev => prev.filter(i => i.id !== id));
      } catch (e) { alert('Erro ao excluir imagem'); }
    }
  };

  const handleDeleteMultipleGallery = async (ids: string[]) => {
    if (confirm(`Deseja realmente excluir as ${ids.length} lembranças selecionadas?`)) {
      try {
        await Promise.all(ids.map(id => api.delete('gallery', id)));
        setGallery(prev => prev.filter(i => !ids.includes(i.id)));
      } catch (e) { alert('Erro ao excluir imagens'); }
    }
  };

  const handleUploadLibrary = async (file: LibraryFile) => {
    try {
      await api.post('library', file);
      setLibrary(prev => [file, ...prev]);
    } catch (e: any) { 
      console.error('Library Upload Error:', e);
      if (e.message?.includes('413') || e.message?.includes('Too Large')) {
        alert('O arquivo é muito grande para o servidor. Tente reduzir o tamanho (máx 150MB).');
      } else {
        alert('Erro ao enviar arquivo. Verifique sua conexão e tente novamente.'); 
      }
    }
  };

  const handleDeleteLibrary = async (id: string) => {
    if (confirm('Deseja realmente excluir este material?')) {
      try {
        await api.delete('library', id);
        setLibrary(prev => prev.filter(f => f.id !== id));
      } catch (e) { alert('Erro ao excluir arquivo'); }
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const s = students.find(x => x.id === id);
    const p = { ...defaultPermissions, ...currentUser?.permissions };
    if (s?.status === 'Concluido' && !p.students_confirmed_manage) return alert('Sem permissão para excluir crismados.');
    
    if(confirm("Confirma a exclusão deste catequizando?")) {
      try {
        await api.delete('students', id);
        setStudents(prev => prev.filter(st => st.id !== id));
      } catch(e) { alert('Erro ao excluir'); }
    }
  };

  const handleDeleteClass = async (id: string) => {
    if(confirm("Excluir esta turma? Os alunos ficarão sem turma vinculada.")) {
        try {
            await api.delete('turmas', id);
            setClasses(prev => prev.filter(t => t.id !== id));
        } catch(e) { alert('Erro ao excluir turma'); }
    }
  };

  const handleSaveCatequista = async (c: Catequista) => {
    try {
        const exists = catequistas.find(x => x.id === c.id);
        if (exists) {
            await api.put('catequistas', c.id, c);
            setCatequistas(prev => prev.map(x => x.id === c.id ? c : x));
        } else {
            await api.post('catequistas', c);
            setCatequistas(prev => [...prev, c]);
        }
        setView('catequista_list');
    } catch(e) { alert('Erro ao salvar catequista'); }
  };

  const handleDeleteCatequista = async (id: string) => {
      if(confirm("Excluir catequista?")) {
          try {
              await api.delete('catequistas', id);
              setCatequistas(prev => prev.filter(c => c.id !== id));
          } catch(e) { alert('Erro ao excluir'); }
      }
  };

  const handleSaveFormation = async (f: FormationEvent) => {
      try {
          const exists = formations.find(x => x.id === f.id);
          if (exists) {
              await api.put('formations', f.id, f); 
              setFormations(prev => prev.map(x => x.id === f.id ? f : x));
          } else {
              await api.post('formations', f);
              setFormations(prev => [...prev, f]);
          }
          setView('formation_list');
      } catch(e) { alert('Erro ao salvar formação'); }
  };

  const handleFormationAttendance = async (id: string, ids: string[]) => {
      try {
          const f = formations.find(x => x.id === id);
          if(f) {
              const updated = { ...f, presentes: ids };
              await api.put('formations', id, updated);
              setFormations(prev => prev.map(x => x.id === id ? updated : x));
              setTakingFormationAttendance(null);
          }
      } catch(e) { alert('Erro ao salvar presença'); }
  };

  const handleSaveConfig = async (newConfig: ParishConfig) => {
      try {
          await api.saveConfig(newConfig);
          setParishConfig(newConfig);
          alert('Configurações salvas!');
      } catch(e) { alert('Erro ao salvar configurações'); }
  };

  const handleDateChange = (date: string) => {
    setSuggestedDate(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  const p: UserPermissions = {
    ...defaultPermissions,
    ...(currentUser?.permissions || {})
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={handleSetView} 
      currentUser={currentUser!} 
      onLogout={handleLogout} 
      parishConfig={parishConfig} 
    >
      
      {currentView === 'dashboard' && p.dashboard && <div className="animate-in fade-in"><DashboardContent events={events} students={students} classes={filteredClasses} catequistas={catequistas} suggestedDate={suggestedDate} onDateChange={handleDateChange} onAddEvent={(d: string) => { setSuggestedDate(d || suggestedDate); setIsAddingEvent(true); }} user={currentUser} onTakeEventAttendance={setTakingEventAttendance} /></div>}
      
      {currentView === 'register' && p.students_create && <RegistrationForm config={parishConfig} onSave={handleSaveStudent} onCancel={() => handleSetView('list')} initialData={editingStudent} allClasses={classes} />}
      
      {currentView === 'list' && p.students_view && (
        <StudentTable 
          students={filteredStudentsByPermission} 
          allClasses={classes}
          onDelete={handleDeleteStudent} 
          onView={(s) => setSelectedStudent(s)} 
          onEdit={(s) => { 
            if (s.status === 'Concluido' && !p.students_confirmed_manage) return alert('Sem permissão para editar crismados.');
            setEditingStudent(s); setView('register'); 
          }} 
          onManageDocuments={(s) => setManagingDocuments(s)}
          onAddNew={p.students_create ? () => handleSetView('register') : undefined}
        />
      )}

      {currentView === 'classes_list' && p.classes && (
        <ClassTable 
          classes={filteredClasses} 
          onDelete={handleDeleteClass} 
          onEdit={t => { setEditingClass(t); setView('classes_create'); }} 
          onViewMembers={setViewingClassMembers} 
          onTakeAttendance={setTakingAttendance} 
          onViewHistory={setViewingClassHistory} 
          onAddNew={currentUser?.role === 'coordenador_paroquial' || currentUser?.role === 'coordenador_comunidade' ? () => handleSetView('classes_create') : undefined}
        />
      )}
      {currentView === 'classes_create' && p.classes && <ClassForm onSave={handleSaveClass} onCancel={() => setView('classes_list')} initialData={editingClass || undefined} allStudents={students} catequistas={catequistas} />}
      
      {currentView === 'gallery' && p.gallery_view && (
        <GalleryView 
          images={filteredGalleryByPermission} 
          onUpload={handleUploadGallery}
          onEdit={handleEditGallery}
          onDelete={handleDeleteGallery}
          onDeleteMultiple={handleDeleteMultipleGallery}
          canUpload={p.gallery_upload}
          canDelete={p.gallery_delete}
          availableClasses={currentUser?.role === 'coordenador_paroquial' ? classes : filteredClasses}
        />
      )}

      {currentView === 'library' && p.library_view && (
        <LibraryView 
          files={library} 
          onUpload={handleUploadLibrary} 
          onDelete={handleDeleteLibrary}
          canUpload={p.library_upload}
          canDelete={p.library_delete}
        />
      )}

      {currentView === 'catequista_list' && p.catequistas && (
        <CatequistaTable 
          catequistas={catequistas} 
          onDelete={handleDeleteCatequista} 
          onEdit={c => { setEditingCatequista(c); setView('catequista_create'); }} 
          onViewHistory={setViewingCatequistaHistory} 
          onAddNew={() => handleSetView('catequista_create')}
        />
      )}
      {currentView === 'catequista_create' && p.catequistas && <CatequistaForm onSave={handleSaveCatequista} onCancel={() => setView('catequista_list')} initialData={editingCatequista || undefined} />}
      
      {currentView === 'formation_list' && p.formations && (
        <FormationTable 
          formations={formations} 
          onDelete={async (id) => { if(confirm('Excluir formação?')) { await api.delete('formations', id); setFormations(prev => prev.filter(f => f.id !== id)); }}} 
          onEdit={f => { setEditingFormation(f); setView('formation_create'); }} 
          onAttendance={f => setTakingFormationAttendance(f)} 
        />
      )}
      {currentView === 'formation_create' && p.formations && (
        <FormationForm 
          onSave={handleSaveFormation} 
          onCancel={() => setView('formation_list')} 
          initialData={editingFormation || undefined} 
        />
      )}

      {currentView === 'attendance_quick' && p.attendance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(t => <button key={t.id} onClick={() => setTakingAttendance(t)} className="bg-white p-8 rounded-[2rem] border border-sky-50 hover:shadow-xl transition-all text-left"><div className="bg-sky-100 w-12 h-12 rounded-2xl flex items-center justify-center text-sky-600 mb-4"><CheckCircle2 /></div><h4 className="font-black text-slate-800">{t.nome}</h4><p className="text-xs text-slate-400 uppercase">{t.diaSemana} • {t.horario}</p></button>)}
        </div>
      )}

      {currentView === 'reports' && p.reports && <Reports students={filteredStudentsByPermission} classes={filteredClasses} attendanceSessions={attendanceSessions} />}
      {currentView === 'attendance_report' && p.attendance_report && <AttendanceReport classes={filteredClasses} attendanceSessions={attendanceSessions} catequistas={catequistas} config={parishConfig} />}
      {currentView === 'certificates' && p.certificates && <CertificateGenerator config={parishConfig} students={filteredStudentsByPermission} />}
      {currentView === 'profile' && <ProfileForm currentUser={currentUser!} onSave={handleSaveProfile} onCancel={() => setView('dashboard')} />}
      {currentView === 'users_list' && p.users_management && <UserList users={users} currentUser={currentUser!} onEdit={u => { setEditingUser(u); setView('users_create'); }} onDelete={async (id) => { if(confirm('Excluir usuário?')) { await api.delete('users', id); setUsers(prev => prev.filter(u => u.id !== id)); }}} onCreateNew={() => handleSetView('users_create')} />}
      {currentView === 'users_create' && p.users_management && <UserForm onSave={handleSaveUser} onCancel={() => setView('users_list')} initialData={editingUser || undefined} availableClasses={classes} catequistas={catequistas} />}
      
      {currentView === 'config' && currentUser?.role === 'coordenador_paroquial' && <ConfigForm config={parishConfig} onSave={handleSaveConfig} />}

      {selectedStudent && <StudentDetailsModal config={parishConfig} student={selectedStudent} attendanceSessions={attendanceSessions} classes={classes} onClose={() => setSelectedStudent(null)} />}
      {managingDocuments && (
        <StudentDocumentsModal 
          student={managingDocuments} 
          onClose={() => setManagingDocuments(null)} 
          onUpdateDocuments={(docs) => handleUpdateStudentDocuments(managingDocuments.id, docs)} 
        />
      )}
      {viewingClassMembers && <ClassMembersModal turma={viewingClassMembers} members={students.filter(s => s.turma === viewingClassMembers.nome)} onClose={() => setViewingClassMembers(null)} onViewStudent={(s) => setSelectedStudent(s)} />}
      {takingAttendance && <ClassAttendanceModal turma={takingAttendance} members={students.filter(s => s.turma === takingAttendance.nome)} onClose={() => setTakingAttendance(null)} onSave={handleSaveAttendance} existingSessions={attendanceSessions} />}
      {viewingClassHistory && <ClassHistoryModal turma={viewingClassHistory} sessions={attendanceSessions} members={students.filter(s => s.turma === viewingClassHistory.nome)} onClose={() => setViewingClassHistory(null)} config={parishConfig} />}
      {viewingCatequistaHistory && <CatequistaHistoryModal catequista={viewingCatequistaHistory} formations={formations} parishEvents={events} onClose={() => setViewingCatequistaHistory(null)} />}
      {takingFormationAttendance && (
        <FormationAttendanceModal 
          formation={takingFormationAttendance} 
          catequistas={catequistas} 
          onClose={() => setTakingFormationAttendance(null)} 
          onSave={handleFormationAttendance} 
        />
      )}
      
      {isAddingEvent && <EventFormModal initialDate={suggestedDate} onSave={handleSaveEvent} onClose={() => setIsAddingEvent(false)} />}
      {takingEventAttendance && <ParishEventAttendanceModal event={takingEventAttendance} catequistas={catequistas} onClose={() => setTakingEventAttendance(null)} onSave={handleSaveEventAttendance} />}
    </Layout>
  );
};

// Extracted for readability, typically would be its own file
const DashboardContent = ({ events, students, classes, catequistas, suggestedDate, onDateChange, onAddEvent, user, onTakeEventAttendance }: any) => {
    // Re-use logic from previous App.tsx renderDashboard
    const selectedDayEvents = events.filter((e: any) => e.dataInicio === suggestedDate);
    const dateObj = new Date(suggestedDate + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    const viewableStudents = students; // Simplified passing
    const totalClassesCount = classes.length;
    const activeStudentsCount = students.filter((s:any) => s.status === 'Ativo').length;
    const crismadosCount = students.filter((s:any) => s.status === 'Concluido').length;
    const activeCatequistasCount = catequistas.filter((c:any) => c.status === 'Ativo').length;

    return (
      <div className="space-y-10 pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Painel Pastoral</h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              Bem-vindo(a), <span className="text-sky-600 font-black">{user?.nome}</span>.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg">
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Catequizandos</p><h3 className="text-3xl font-bold text-slate-800">{viewableStudents.length}</h3></div>
             <div className="flex gap-4 pt-4 border-t border-slate-50"><div><p className="text-[9px] font-black text-green-600 uppercase">Ativos: {activeStudentsCount}</p></div></div>
           </div>
           <div className="bg-white p-7 rounded-[2rem] border border-sky-50 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg">
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Turmas</p><h3 className="text-3xl font-bold text-slate-800">{totalClassesCount}</h3></div>
           </div>
           <div className="bg-sky-600 p-7 rounded-[2.5rem] text-white shadow-xl shadow-sky-100 flex flex-col justify-between">
             <div><p className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-1">Crismados</p><h3 className="text-4xl font-black">{crismadosCount}</h3></div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           <div className="xl:col-span-3 h-[500px]">
              <CalendarView events={events} selectedDate={suggestedDate} onDateChange={onDateChange} onAddEvent={onAddEvent} />
           </div>
           <div className="xl:col-span-9 bg-white rounded-[2.5rem] border border-sky-50 p-8 shadow-sm h-[500px] flex flex-col">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Eventos em {dayName}</h4>
              <div className="space-y-4 flex-1 overflow-y-auto">
                  {selectedDayEvents.length > 0 ? selectedDayEvents.map((event: any) => (
                      <div key={event.id} className="bg-sky-50/50 p-4 rounded-3xl border border-sky-100/50 flex justify-between items-center">
                          <div>
                              <p className="font-bold text-slate-800">{event.titulo}</p>
                              <p className="text-xs text-slate-500">{event.horarioInicio} - {event.local}</p>
                          </div>
                          <button onClick={() => onTakeEventAttendance(event)} className="p-2 text-sky-600 bg-white rounded-xl shadow-sm"><CheckCircle2 /></button>
                      </div>
                  )) : <p className="text-center text-slate-400 py-10 italic">Sem eventos</p>}
              </div>
           </div>
        </div>
      </div>
    );
};

export default App;
