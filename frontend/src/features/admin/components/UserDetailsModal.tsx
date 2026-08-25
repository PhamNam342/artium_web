import { useState, useEffect } from 'react';
import { X, User, MapPin, Link as LinkIcon, Shield, Briefcase, Calendar } from 'lucide-react';
import { getAdminUserDetail } from '../../../services/adminService';
import type {
  AdminUser,
  AdminUserDetail,
} from '../../../services/adminService';

interface UserDetailsModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

export default function UserDetailsModal({ isOpen, user, onClose }: UserDetailsModalProps) {
  const [profile, setProfile] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        setProfile(null);
        try {
          const data = await getAdminUserDetail(user.id);
          setProfile(data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setProfile(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          >
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 flex-shrink-0">
                  {user.avatar_url ? (
                    <img className="h-24 w-24 rounded-full object-cover" src={user.avatar_url} alt="" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{user.full_name || 'No name provided'}</h4>
                  <p className="text-gray-500 mt-1">{user.email}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-red-500" />}
                      {user.role === 'ARTIST' && <Briefcase className="w-4 h-4 text-blue-500" />}
                      {user.role === 'COLLECTOR' && <User className="w-4 h-4 text-green-500" />}
                      <span>{user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Joined Date</h5>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {profile?.location && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">Location</h5>
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                )}
                
                {profile?.seller_profile?.website_url && (
                  <div className="sm:col-span-2">
                    <h5 className="text-sm font-medium text-gray-500 mb-1">Website</h5>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <a href={profile.seller_profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.seller_profile.website_url}
                      </a>
                    </div>
                  </div>
                )}
                
                {profile?.seller_profile?.bio && (
                  <div className="sm:col-span-2">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Bio</h5>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{profile.seller_profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
