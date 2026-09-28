import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Star, 
  MessageSquare, 
  Phone, 
  ExternalLink 
} from 'lucide-react';
import type { EmergencyContact, LocationDetails } from '../types';
import { generateSosMessage, getWhatsAppShareUrl } from '../utils/geo';
import { triggerHaptic } from '../utils/audio';

interface ContactsManagerProps {
  contacts: EmergencyContact[];
  onSaveContacts: (updated: EmergencyContact[]) => void;
  location: LocationDetails | null;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  contacts,
  onSaveContacts,
  location,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('Friend');
  const [newPhone, setNewPhone] = useState('');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    triggerHaptic([50]);
    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      relationship: newRelationship.trim(),
      phone: newPhone.trim(),
      isPrimary: contacts.length === 0,
      enableWhatsApp: true,
    };

    onSaveContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const handleDeleteContact = (id: string) => {
    triggerHaptic([40]);
    onSaveContacts(contacts.filter(c => c.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    triggerHaptic([40]);
    onSaveContacts(
      contacts.map(c => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  const testSosMessage = generateSosMessage(location);

  return (
    <div className="space-y-4 pb-8 animate-in fade-in">
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Trusted Circle</h2>
            <p className="text-xs text-slate-400">Emergency Contacts ({contacts.length})</p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic([30]);
            setIsAdding(!isAdding);
          }}
          className="min-h-[40px] px-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddContact} className="bg-slate-900 rounded-3xl p-5 border border-purple-500/40 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            New Emergency Contact
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sister Emma"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Relationship</label>
              <select
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Partner">Partner</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="min-h-[40px] px-3.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2.5">
        {contacts.map((contact) => {
          const testWaUrl = getWhatsAppShareUrl(testSosMessage, contact.phone);

          return (
            <div
              key={contact.id}
              className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{contact.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {contact.relationship}
                  </span>
                  {contact.isPrimary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/80 font-semibold">
                      Primary
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {contact.phone}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={testWaUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Test WhatsApp dispatch link"
                  className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900 flex items-center justify-center transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleSetPrimary(contact.id)}
                  title={contact.isPrimary ? 'Primary contact' : 'Set as primary contact'}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    contact.isPrimary
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${contact.isPrimary ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteContact(contact.id)}
                  title="Remove contact"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};