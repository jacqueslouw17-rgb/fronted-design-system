/**
 * Flow 2 v3 - Candidate Data Collection (Single Page Form)
 * 
 * Re-exports the single-page form component.
 * Version: v3 (future)
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import F2v3_CandidateDataForm from "./flows/F2v3_CandidateDataForm";

const CandidateDataCollectionV3 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/candidate-data-collection-v3" && 
        location.pathname !== "/flows/candidate-data-collection-v3") {
      navigate("/candidate-data-collection-v3", { replace: true });
    }
  }, [location.pathname, navigate]);

  return <F2v3_CandidateDataForm />;
};

export default CandidateDataCollectionV3;
