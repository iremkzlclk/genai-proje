"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { Trash2, Plus, GripVertical, Calendar, LogOut, UserPlus, LogIn } from "lucide-react";

/* ---------------- TYPES ---------------- */
type TaskStatus = "todo" | "doing" | "done";

type Task = {
  id: string;
  content: string;
  status: TaskStatus;
  dueDate?: string;     
};

type UserAccount = {
  email: string;
  password: string;
};

/* ---------------- SÜTUN BİLEŞENİ ---------------- */
function DroppableColumn({ id, label, dotColor, tasks, children, onAdd }: any) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
          <h2 className="font-bold text-slate-700 text-xs tracking-[0.2em]">{label}</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="bg-[#eef2f6] p-4 rounded-[2rem] min-h-[500px] flex flex-col transition-all border-2 border-transparent hover:border-slate-200"
      >
        <SortableContext items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1">
            {children}
            {tasks.length === 0 && (
              <div className="h-32 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] italic">
                Buraya kart bırakın ✨
              </div>
            )}
          </div>
        </SortableContext>

        <button
          onClick={onAdd}
          className="w-full py-4 mt-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2 text-sm font-bold group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
          Add Task
        </button>
      </div>
    </div>
  );
}

/* ---------------- KART BİLEŞENİ ---------------- */
function TaskCard({ id, content, status, dueDate, onDelete }: any) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const statusColors = {
    todo: "border-l-blue-500",
    doing: "border-l-amber-500",
    done: "border-l-emerald-500",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 mb-3 rounded-xl shadow-sm border border-slate-200 border-l-4 ${statusColors[status as TaskStatus]} flex flex-col gap-2 touch-none cursor-grab active:cursor-grabbing hover:shadow-md transition-all group`}
    >
      <div className="flex items-center gap-3">
        <GripVertical size={16} className="text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
        <span className="flex-1 font-medium text-slate-700 leading-tight break-words text-sm">{content}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(id); }} 
          className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {dueDate && (
        <div className="flex items-center gap-2 text-[10px] font-bold mt-1 border-t border-slate-50 pt-2">
          <Calendar size={10} className="text-blue-500" />
          <span className="text-slate-400 uppercase tracking-wider">Son Tarih:</span>
          <span className="text-slate-600 uppercase">{dueDate}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- ANA SAYFA ---------------- */
export default function Page() {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("activeUser");
    if (savedUser) {
        setActiveUser(savedUser);
        const savedTasks = localStorage.getItem(`tasks_${savedUser}`);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    if (mounted && activeUser) {
        localStorage.setItem(`tasks_${activeUser}`, JSON.stringify(tasks));
    }
  }, [tasks, mounted, activeUser]);

  const handleAuth = () => {
    if (!email || !password) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    const users: UserAccount[] = JSON.parse(localStorage.getItem("userAccounts") || "[]");

    if (isRegistering) {
        // KAYIT OLMA
        if (users.find(u => u.email === email)) {
            alert("Bu e-posta zaten kayıtlı!");
            return;
        }
        const newUsers = [...users, { email, password }];
        localStorage.setItem("userAccounts", JSON.stringify(newUsers));
        alert("Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.");
        setIsRegistering(false);
    } else {
        // GİRİŞ YAPMA
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setActiveUser(email);
            localStorage.setItem("activeUser", email);
            const savedTasks = localStorage.getItem(`tasks_${email}`);
            setTasks(savedTasks ? JSON.parse(savedTasks) : []);
        } else {
            alert("Hatalı e-posta veya şifre!");
        }
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("activeUser");
    setEmail("");
    setPassword("");
    setTasks([]);
  };

  // Dnd Kit Ayarları
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const isOverAColumn = ["todo", "doing", "done"].includes(overId);
    const overStatus = isOverAColumn ? (overId as TaskStatus) : tasks.find((t) => t.id === overId)?.status;

    if (overStatus && activeTask.status !== overStatus) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const updatedTasks = [...prev];
        updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: overStatus };
        return updatedTasks;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      setTasks((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const addTask = (status: TaskStatus) => {
    const content = window.prompt("Görev nedir?");
    if (!content || content.trim() === "") return;
    const date = window.prompt("Son teslim tarihini girin (Örn: 15 Mayıs):");
    setTasks([...tasks, { id: crypto.randomUUID(), content, status, dueDate: date || undefined }]);
  };

  if (!mounted) return null;

  
  if (!activeUser) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f1f5f9] p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl w-full max-w-md border border-white">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 mb-2">Taskflow</h1>
            <p className="text-slate-400 font-medium">{isRegistering ? "Yeni bir hesap oluştur" : "Hesabına giriş yap"}</p>
        </div>
        
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-2">E-posta</label>
                <input 
                    className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all text-slate-900" 
                    placeholder="ornek@mail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-2">Şifre</label>
                <input 
                    type="password"
                    className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all text-slate-900" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
        </div>

        <button 
            onClick={handleAuth} 
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl mt-8 hover:bg-blue-600 shadow-lg transition-all flex items-center justify-center gap-2"
        >
            {isRegistering ? <UserPlus size={20}/> : <LogIn size={20}/>}
            {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
        </button>

        <p className="text-center mt-6 text-sm text-slate-500">
            {isRegistering ? "Zaten hesabın var mı?" : "Henüz hesabın yok mu?"}
            <button 
                onClick={() => setIsRegistering(!isRegistering)} 
                className="ml-1 font-bold text-blue-600 hover:underline"
            >
                {isRegistering ? "Giriş Yap" : "Hemen Kayıt Ol"}
            </button>
        </p>
      </div>
    </div>
  );

  const columns: { id: TaskStatus; label: string; dotColor: string }[] = [
    { id: "todo", label: "TODO", dotColor: "bg-blue-500" },
    { id: "doing", label: "DOING", dotColor: "bg-amber-500" },
    { id: "done", label: "DONE", dotColor: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-800 leading-none">Taskflow</h1>
            <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Aktif: {activeUser}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm uppercase"
          >
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {columns.map((col) => (
              <DroppableColumn
                key={col.id}
                id={col.id}
                label={col.label}
                dotColor={col.dotColor}
                tasks={tasks.filter((t) => t.status === col.id)}
                onAdd={() => addTask(col.id)}
              >
                {tasks
                  .filter((t) => t.status === col.id)
                  .map((task) => (
                    <TaskCard 
                      key={task.id} 
                      {...task} 
                      onDelete={(id: string) => setTasks(prev => prev.filter(t => t.id !== id))} 
                    />
                  ))}
              </DroppableColumn>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}