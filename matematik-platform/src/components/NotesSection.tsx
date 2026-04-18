'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StickyNote, Plus, Search, X, Edit2, Trash2, Pin, PinOff,
  Bold, Italic, Underline, Heading1, List, ListOrdered, Link as LinkIcon, Folder, Clock
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Note, NoteCategory } from '@/types/index';

const sanitizeHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(s => s.remove());
  return doc.body.innerHTML;
};

interface NotesSectionProps {
  userId: string;
}

export default function NotesSection({ userId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [notesRes, categoriesRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', userId).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }),
      supabase.from('note_categories').select('*').eq('user_id', userId).order('name'),
    ]);
    if (notesRes.data) setNotes(notesRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allTags = [...new Set(notes.flatMap(n => n.tags))].filter(Boolean);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title || '',
        content: note.content,
        category: note.category || '',
        tags: note.tags || [],
      });
    } else {
      setEditingNote(null);
      setFormData({ title: '', content: '', category: '', tags: [] });
    }
    setShowModal(true);
    setShowCategoryInput(false);
    setNewCategory('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', category: '', tags: [] });
    setNewCategory('');
    setShowCategoryInput(false);
  };

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML || '';
    
    if (editingNote) {
      await supabase.from('notes').update({
        title: formData.title || null,
        content,
        category: formData.category || null,
        tags: formData.tags,
        updated_at: new Date().toISOString(),
      }).eq('id', editingNote.id);
    } else {
      await supabase.from('notes').insert({
        user_id: userId,
        title: formData.title || null,
        content,
        category: formData.category || null,
        tags: formData.tags,
      });
    }

    if (showCategoryInput && newCategory && !categories.find(c => c.name === newCategory)) {
      await supabase.from('note_categories').insert({
        user_id: userId,
        name: newCategory,
      });
    }

    handleCloseModal();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Notu silmek istediğinize emin misiniz?')) {
      await supabase.from('notes').delete().eq('id', id);
      loadData();
    }
  };

  const handleTogglePin = async (note: Note) => {
    await supabase.from('notes').update({ is_pinned: !note.is_pinned }).eq('id', note.id);
    loadData();
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StickyNote className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Notlarım</h2>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-sm rounded-full">
            {filteredNotes.length}
          </span>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Not
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Notlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        )}

        {allTags.length > 0 && (
          <select
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="">Tüm Etiketler</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">
            {searchQuery || selectedCategory || selectedTag ? 'Arama sonucu bulunamadı' : 'Henüz not eklemediniz'}
          </p>
          {!searchQuery && !selectedCategory && !selectedTag && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              İlk notunu ekle
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold truncate flex-1">
                  {note.title || 'Başlıksız Not'}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePin(note)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title={note.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                  >
                    {note.is_pinned ? (
                      <PinOff className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Pin className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenModal(note)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {note.category && (
                <div className="flex items-center gap-1 mb-2">
                  <Folder className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300">{note.category}</span>
                </div>
              )}

              <div 
                className="text-slate-300 text-sm line-clamp-4 prose prose-sm prose-invert max-w-none mb-3 [&>ul]:list-disc [&>ol]:list-decimal [&>li]:ml-4"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
              />

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {new Date(note.updated_at).toLocaleDateString('tr-TR')}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl"
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingNote ? 'Notu Düzenle' : 'Yeni Not'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Not başlığı..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Kategori</label>
                  {showCategoryInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Yeni kategori..."
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                      />
                      <button
                        onClick={() => {
                          if (newCategory) {
                            setFormData({ ...formData, category: newCategory });
                            setShowCategoryInput(false);
                          }
                        }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => setShowCategoryInput(false)}
                        className="px-4 py-2 bg-white/10 text-slate-300 rounded-xl hover:bg-white/15 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="">Kategori seç...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowCategoryInput(true)}
                        className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/15 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Yeni
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">İçerik</label>
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="flex flex-wrap gap-1 p-2 bg-white/5 border-b border-white/10">
                      <ToolbarButton icon={Bold} title="Kalın" onClick={() => execCommand('bold')} />
                      <ToolbarButton icon={Italic} title="İtalik" onClick={() => execCommand('italic')} />
                      <ToolbarButton icon={Underline} title="Altı çizili" onClick={() => execCommand('underline')} />
                      <div className="w-px h-6 bg-white/10 mx-1" />
                      <ToolbarButton icon={Heading1} title="Başlık" onClick={() => execCommand('formatBlock', 'h1')} />
                      <div className="w-px h-6 bg-white/10 mx-1" />
                      <ToolbarButton icon={List} title="Liste" onClick={() => execCommand('insertUnorderedList')} />
                      <ToolbarButton icon={ListOrdered} title="Numaralı Liste" onClick={() => execCommand('insertOrderedList')} />
                      <div className="w-px h-6 bg-white/10 mx-1" />
                      <ToolbarButton 
                        icon={LinkIcon} 
                        title="Bağlantı" 
                        onClick={() => {
                          const url = prompt('Bağlantı URL\'si:');
                          if (url) execCommand('createLink', url);
                        }} 
                      />
                    </div>
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => setFormData({ ...formData, content: e.currentTarget.innerHTML })}
                      className="min-h-[200px] p-4 text-white focus:outline-none prose prose-sm prose-invert max-w-none [&>h1]:text-2xl [&>h1]:font-bold [&>ul]:list-disc [&>ol]:list-decimal [&>li]:ml-4 [&>a]:text-purple-400 [&>a]:underline"
                      style={{ whiteSpace: 'pre-wrap' }}
                      dangerouslySetInnerHTML={{ __html: editingNote ? sanitizeHtml(editingNote.content) : '' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Etiketler</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-lg"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Etiket ekle..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/15 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/15 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                >
                  {editingNote ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
