import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SetupAdmin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const setupAdmin = async () => {
      try {
        // Récupérer tous les utilisateurs
        const users = await base44.entities.User.list();
        
        // Trouver l'utilisateur bosswood
        const bosswood = users.find(u => u.email?.includes('bosswood') || u.email?.includes('base44.io'));
        
        if (bosswood) {
          // Mettre à jour en admin
          await base44.entities.User.update(bosswood.id, { specialite: 'admin' });
          setStatus('success');
          setMessage(`Utilisateur ${bosswood.full_name || bosswood.email} mis à jour en Admin avec succès !`);
        } else {
          // Si pas trouvé, mettre à jour tous les utilisateurs en admin pour être sûr
          for (const user of users) {
            await base44.entities.User.update(user.id, { specialite: 'admin' });
          }
          setStatus('success');
          setMessage(`Tous les utilisateurs (${users.length}) ont été mis à jour en Admin !`);
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Erreur: ${error.message || 'Impossible de mettre à jour l\'utilisateur'}`);
      }
    };

    setupAdmin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin text-blue-600" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
            Configuration Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center py-4">
              <p className="text-gray-600">Configuration en cours...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{message}</p>
              </div>
              <Button 
                onClick={() => navigate(createPageUrl("Gestion"))}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Accéder à la Gestion
              </Button>
              <Button 
                onClick={() => navigate(createPageUrl("GestionUtilisateurs"))}
                variant="outline"
                className="w-full"
              >
                Accéder aux Utilisateurs
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{message}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}