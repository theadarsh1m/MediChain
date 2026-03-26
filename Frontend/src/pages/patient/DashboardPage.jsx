import { useOutletContext } from "react-router-dom";
import PatientDashboardContainer from "../../components/dashboard/container/PatientDashboardContainer";

export default function DashboardPage() {
  const { patient } = useOutletContext();
  return <PatientDashboardContainer patient={patient} />;
}
