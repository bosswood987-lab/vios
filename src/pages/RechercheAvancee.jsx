import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Calendar, FileText, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInYears } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function RechercheAvancee() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [filtres, setFiltres] = useState({
    diagnostic: "",
    genre: "tous",
    age_min: "",
    age_max: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      if (user.specialite !== 'admin') {
        navigate(createPageUrl("SalleAttente"));
      }
    };
    loadUser();
  }, [navigate]);

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
    initialData: [],
  });

  const { data: examensOpht } = useQuery({
    queryKey: ['examens-ophtalmologie-all'],
    queryFn: () => base44.entities.ExamenOphtalmologie.list('-date_examen'),
    initialData: [],
  });

  const calculerAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    return differenceInYears(new Date(), new Date(dateNaissance));
  };

  const resultatsRecherche = patients.filter(patient => {
    // Filtre par genre
    if (filtres.genre !== "tous" && patient.genre !== filtres.genre) {
      return false;
    }

    // Filtre par âge
    const age = calculerAge(patient.date_naissance);
    if (filtres.age_min && age < parseInt(filtres.age_min)) {
      return false;
    }
    if (filtres.age_max && age > parseInt(filtres.age_max)) {
      return false;
    }

    // Filtre par diagnostic
    if (filtres.diagnostic) {
      const examensPatient = examensOpht.filter(e => e.patient_id === patient.id);
      const diagnosticTrouve = examensPatient.some(e => 
        e.diagnostic?.toLowerCase().includes(filtres.diagnostic.toLowerCase()) ||
        e.conduite_tenir?.toLowerCase().includes(filtres.diagnostic.toLowerCase())
      );
      if (!diagnosticTrouve) return false;
    }

    return true;
  });

  if (!currentUser || currentUser.specialite !== 'admin') {
    return null;
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recherche avancée</h1>
            <p className="text-gray-500 mt-1">Recherchez des patients selon différents critères</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Critères de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Diagnostic / Conduite à tenir</Label>
                <Input
                  value={filtres.diagnostic}
                  onChange={(e) => setFiltres({ ...filtres, diagnostic: e.target.value })}
                  placeholder="Rechercher dans les diagnostics..."
                />
              </div>

              <div>
                <Label>Genre</Label>
                <Select
                  value={filtres.genre}
                  onValueChange={(value) => setFiltres({ ...filtres, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous</SelectItem>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Âge minimum</Label>
                <Input
                  type="number"
                  value={filtres.age_min}
                  onChange={(e) => setFiltres({ ...filtres, age_min: e.target.value })}
                  placeholder="Ex: 18"
                />
              </div>

              <div>
                <Label>Âge maximum</Label>
                <Input
                  type="number"
                  value={filtres.age_max}
                  onChange={(e) => setFiltres({ ...filtres, age_max: e.target.value })}
                  placeholder="Ex: 65"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setFiltres({
                  diagnostic: "",
                  genre: "tous",
                  age_min: "",
                  age_max: ""
                })}
              >
                Réinitialiser
              </Button>
              <p className="text-sm text-gray-500">
                <strong>{resultatsRecherche.length}</strong> résultat{resultatsRecherche.length !== 1 ? 's' : ''} trouvé{resultatsRecherche.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Résultats de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultatsRecherche.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Aucun résultat trouvé</p>
                <p className="text-sm mt-2">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultatsRecherche.map((patient) => {
                  const age = calculerAge(patient.date_naissance);
                  const dernierExamen = examensOpht.find(e => e.patient_id === patient.id);
                  
                  return (
                    <div
                      key={patient.id}
                      onClick={() => navigate(createPageUrl(`DossierPatient?id=${patient.id}`))}
                      className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-br ${
                          patient.genre === "Femme" ? "from-pink-500 to-rose-500" : 
                          patient.genre === "Homme" ? "from-blue-500 to-cyan-500" : 
                          "from-gray-500 to-gray-600"
                        } rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">
                            {patient.prenom?.charAt(0)}{patient.nom?.charAt(0)}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                              {patient.prenom} {patient.nom}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {patient.genre}
                            </Badge>
                            {age && <Badge variant="outline" className="text-xs">{age} ans</Badge>}
                            {patient.ald && <Badge className="bg-red-500 text-white text-xs">ALD</Badge>}
                            {patient.cmu && <Badge className="bg-green-500 text-white text-xs">CMU</Badge>}
                          </div>
                          
                          {dernierExamen && (dernierExamen.diagnostic || dernierExamen.conduite_tenir) && (
                            <div className="mt-2 text-sm text-gray-600">
                              {dernierExamen.diagnostic && (
                                <p className="line-clamp-1">
                                  <strong>Diagnostic:</strong> {dernierExamen.diagnostic}
                                </p>
                              )}
                              {dernierExamen.conduite_tenir && (
                                <p className="line-clamp-1">
                                  <strong>CAT:</strong> {dernierExamen.conduite_tenir}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Dernier examen: {format(new Date(dernierExamen.date_examen), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}