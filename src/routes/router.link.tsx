import React, { Suspense } from "react";
import { all_routes } from "./all_routes";

// Eager pages (your custom ones)
import DrugSearch from "../pages/new/search1";
import InsuranceSearch from "../pages/new/InsuranceSearch";
import Search3 from "../pages/new/search3";
import InsuranceSearch2 from "../pages/new/InsuranceSearch2";
import MainDashboard from "../pages/new/MainDashboard";
import FirstDashboard from "../pages/new/Dashboard";
import SecondDashBoard from "../pages/new/SecondDashboard";
import ThirdDashBoard from "../pages/new/ThirdDashboard";
import LandingPage from "../pages/new/home";
import HowItWorksModern from "../pages/new/help";
import UserActivityLogs from "../pages/new/logs";
import DrugPage from "../pages/new/DrugPage";
import CartPageWithContext from "../components/CartPageWithContext";
import OrderHistoryPro from "../pages/new/orderHistory";
import UiPlaceholders from "../pages/ui-intrerface/base-ui/ui-placeholders/uiPlaceholders";
import UiOffcanvas from "../pages/ui-intrerface/base-ui/ui-offcanvas/uiOffcanvas";
import UiPagination from "../pages/ui-intrerface/base-ui/ui-pagination/uiPagination";
import UiListGroup from "../pages/ui-intrerface/base-ui/ui-list-group/uiListGroup";
import UiLinks from "../pages/ui-intrerface/base-ui/ui-links/uiLinks";
import UiGrid from "../pages/ui-intrerface/base-ui/ui-grid/uiGrid";
import UiImages from "../pages/ui-intrerface/base-ui/ui-images/uiImages";
import UiCollapse from "../pages/ui-intrerface/base-ui/ui-collapse/uiCollapse";
import UiModals from "../pages/ui-intrerface/base-ui/ui-modals/uiModals";
import UiRatio from "../pages/ui-intrerface/base-ui/ui-ratio/uiRatio";
import UiDropdowns from "../pages/ui-intrerface/base-ui/ui-dropdowns/uiDropdowns";
import UiAccordion from "../pages/ui-intrerface/base-ui/ui-accordion/uiAccordion";
import UiAlerts from "../pages/ui-intrerface/base-ui/ui-alerts/uiAlerts";
import UiAvatar from "../pages/ui-intrerface/base-ui/ui-avatar/uiAvatar";
import UiBadges from "../pages/ui-intrerface/base-ui/ui-badges/uiBadges";
import UiBreadcrumb from "../pages/ui-intrerface/base-ui/ui-breadcrumb/uiBreadcrumb";
import UiButtonsGroup from "../pages/ui-intrerface/base-ui/ui-buttons-group/uiButtonsGroup";
import UiButtons from "../pages/ui-intrerface/base-ui/ui-buttons/uiButtons";
import UiCards from "../pages/ui-intrerface/base-ui/ui-cards/uiCards";
import UiCarousel from "../pages/ui-intrerface/base-ui/ui-carousel/uiCarousel";
import FeedbackForm from "../pages/new/feedback";
import InsuranceDetails from "../pages/new/InsuranceDetails";
import InsuranceBINDetails from "../pages/new/InsuranceBinDetails";
import InsurancePCNDetails from "../pages/new/InsurancePcnDetails";
import SyncData from "../pages/new/ScriptsSync";

// Lazy pages (keep as-is)
const ManageInvoicesDetails = React.lazy(
  () => import("../pages/manage-module/manage-invoices/manageInvoicesDetails")
);
const PlansBillingsSettings = React.lazy(
  () => import("../pages/manage-module/settings/plansBillingsSettings")
);
const PermissionSettings = React.lazy(
  () => import("../pages/manage-module/settings/permissionSettings")
);
const AppearanceSettings = React.lazy(
  () => import("../pages/manage-module/settings/appearanceSettings")
);
const NotificationsSettings = React.lazy(
  () => import("../pages/manage-module/settings/notificationsSettings")
);
const UserPermissionsSettings = React.lazy(
  () => import("../pages/manage-module/settings/userPermissionsSettings")
);
const PreferencesSettings = React.lazy(
  () => import("../pages/manage-module/settings/preferencesSettings")
);
const SecuritySettings = React.lazy(
  () => import("../pages/manage-module/settings/securitySettings")
);
const ManageAddInvoices = React.lazy(
  () => import("../pages/manage-module/manage-invoices/manageAddInvoices")
);
const Messages = React.lazy(
  () => import("../pages/manage-module/messages/messages")
);
const ManageInvoices = React.lazy(
  () => import("../pages/manage-module/manage-invoices/manageInvoices")
);
const ManageEditInvoices = React.lazy(
  () => import("../pages/manage-module/manage-invoices/manageEditInvoices")
);
const GeneralSettings = React.lazy(
  () => import("../pages/manage-module/settings/generalSettings")
);
const Notifications = React.lazy(
  () => import("../pages/manage-module/notifications/notifications")
);
const Staffs = React.lazy(() => import("../pages/manage-module/staffs/staffs"));
const StarterPage = React.lazy(
  () => import("../pages/authentication/starter-page/starterPage")
);
const ComingSoon = React.lazy(
  () => import("../pages/authentication/coming-soon/comingSoon")
);
const UnderMaintenance = React.lazy(
  () => import("../pages/authentication/under-maintenance/underMaintenance")
);
const PrivacyPolicy = React.lazy(
  () => import("../pages/authentication/privacy-policy/privacyPolicy")
);
const TermsAndConditions = React.lazy(
  () =>
    import("../pages/authentication/terms-and-conditions/termsAndConditions")
);
const Error404 = React.lazy(
  () => import("../pages/authentication/error-404/error404")
);
const Error500 = React.lazy(
  () => import("../pages/authentication/error-500/error500")
);
const SignUp = React.lazy(
  () => import("../pages/authentication/register/signUp")
);
const ForgotPassword = React.lazy(
  () => import("../pages/authentication/forgot-password/forgotPassword")
);
const ChangePassword = React.lazy(
  () => import("../pages/authentication/change-password/change-password")
);
const LockScreen = React.lazy(
  () => import("../pages/authentication/lock-screen/lockScreen")
);
const Appointment = React.lazy(
  () => import("../pages/appointments/appointments")
);
const AppointmentConsultation = React.lazy(
  () => import("../pages/appointments/appointmentsConsultation")
);
const Pharmacy = React.lazy(() => import("../pages/pharmacy/pharmacy"));
const MedicalResults = React.lazy(
  () => import("../pages/medical-results/medicalResults")
);
const LabResults = React.lazy(() => import("../pages/lab-results/labResults"));
const StartVisits = React.lazy(() => import("../pages/visits/startVisits"));
const Visits = React.lazy(() => import("../pages/visits/visits"));
const DoctorDetails = React.lazy(
  () => import("../pages/doctors/doctorDetails")
);
const EditDoctors = React.lazy(() => import("../pages/doctors/editDoctors"));
const AddDoctors = React.lazy(() => import("../pages/doctors/addDoctors"));
const AllDoctorsList = React.lazy(
  () => import("../pages/doctors/allDoctorsList")
);
const Doctors = React.lazy(() => import("../pages/doctors/doctors"));
const PatientDetailsDocuments = React.lazy(
  () => import("../pages/patients/patientDetailsDocuments")
);
const PatientDetailsMedicalHistory = React.lazy(
  () => import("../pages/patients/patientDetailsMedicalHistory")
);
const PatientDetailsPrescription = React.lazy(
  () => import("../pages/patients/patientDetailsPrescription")
);
const PatientDetailsLabResults = React.lazy(
  () => import("../pages/patients/patientDetailsLabResults")
);
const PatientDetailsVisitHistory = React.lazy(
  () => import("../pages/patients/patientDetailsVisitHistory")
);
const PatientDetailsVitalSigns = React.lazy(
  () => import("../pages/patients/patientDetailsVitalSigns")
);
const PatientDetailsAppointments = React.lazy(
  () => import("../pages/patients/patientDetailsAppointments")
);
const PatientDetails = React.lazy(
  () => import("../pages/patients/patientDetails")
);
const AddPatient = React.lazy(() => import("../pages/patients/addPatient"));
const EditPatient = React.lazy(() => import("../pages/patients/editPatient"));
const SocialFeed = React.lazy(() => import("../pages/application/socialFeed"));
const SearchResult = React.lazy(
  () => import("../pages/application/searchResult")
);
const FileManager = React.lazy(
  () => import("../pages/application/fileManager")
);
const KanbanView = React.lazy(() => import("../pages/application/kanbanView"));
const Notes = React.lazy(() => import("../pages/application/notes"));
const InvoiceDetails = React.lazy(
  () => import("../pages/application/invoiceDetails")
);
const AddInvoice = React.lazy(() => import("../pages/application/addInvoice"));
const EditInvoice = React.lazy(
  () => import("../pages/application/editInvoice")
);
const Invoice = React.lazy(() => import("../pages/application/invoice"));
const ContactList = React.lazy(
  () => import("../pages/application/contactList")
);
const Contacts = React.lazy(() => import("../pages/application/contacts"));
const EmailDetails = React.lazy(
  () => import("../pages/application/emailDetails")
);
const EmailCompose = React.lazy(
  () => import("../pages/application/emailCompose")
);
const Email = React.lazy(() => import("../pages/application/email"));
const Calendar = React.lazy(() => import("../pages/application/calendar"));
const FormBasicInputs = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-elements/formBasicInputs")
);
const FormCheckboxRadios = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-elements/formCheckboxRadios")
);
const FileUploadPage = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-elements/formFileupload")
);
const FormGridGutters = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-elements/formGridGutters")
);
const FormInputGroups = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-elements/formInputGroups")
);
const FormFloatingLabels = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-layouts/formFloatingLabels")
);
const FormHorizontal = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-layouts/formHorizontal")
);
const FormVertical = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-layouts/formVertical")
);
const FormPickers = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-pickers/formPickers")
);
const FormSelect2 = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-select2/formSelect2")
);
const FormValidation = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-validation/formValidation")
);
const FormWizard = React.lazy(
  () => import("../pages/ui-intrerface/forms/form-wizard/formWizard")
);
const FormMask = React.lazy(
  () => import("../pages/ui-intrerface/forms/input-masks/inputMasks")
);
const ChartApex = React.lazy(
  () => import("../pages/ui-intrerface/charts/apexcharts")
);
const IconBootstrap = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconBootstrap")
);
const IconFlag = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconFlag")
);
const IconFontawesome = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconFontawesome")
);
const IconIonic = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconIonic")
);
const IconMaterial = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconMaterial")
);
const IconPe7 = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconPe7")
);
const IconRemix = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconRemix")
);
const IconTabler = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconTabler")
);
const IconTypicon = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconTypicon")
);
const IconWeather = React.lazy(
  () => import("../pages/ui-intrerface/icons/iconWeather")
);
const DataTables = React.lazy(
  () => import("../pages/ui-intrerface/table/data-tables")
);
const TablesBasic = React.lazy(
  () => import("../pages/ui-intrerface/table/tables-basic")
);
const Widgets = React.lazy(
  () => import("../pages/ui-intrerface/widgets/widgets")
);
const Patients = React.lazy(() => import("../pages/patients/patients"));
const Dashboard = React.lazy(() => import("../pages/dashboard/dashboard"));
const VideoCall = React.lazy(() => import("../pages/application/videoCall"));
const VoiceCall = React.lazy(() => import("../pages/application/voiceCall"));
const Chat = React.lazy(() => import("../pages/application/chat"));
const UiUtilities = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-utilities/uiUtilities")
);
const UiClipboard = React.lazy(
  () => import("../pages/ui-intrerface/ui-advance/uiClipboard")
);
const UiTooltips = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-tooltips/uiTooltips")
);
const UiNavTabs = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-nav-tabs/uiNavTabs")
);
const UiToasts = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-toasts/uiToasts")
);
const UiTypography = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-typography/uiTypography")
);
const ThemeTest = React.lazy(
  () => import("../components/theme-test/themeTest")
);
const UiSpinner = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-spinner/uiSpinner")
);
const UiScrollspy = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-scrollspy/uiScrollspy")
);
const UiProgress = React.lazy(
  () => import("../pages/ui-intrerface/base-ui/ui-progress/uiProgress")
);

const suspenseFallback = <div />;
const Login = React.lazy(() => import("../pages/authentication/Login/login"));

// Public routes (no auth guard attached here)
export const publicRoutes = [
  {
    path: all_routes.drugSearch,
    element: <DrugSearch />,
    meta_title: "Drug Search",
  },
  
  {
    path: all_routes.insuranceSearch,
    element: <InsuranceSearch />,
    meta_title: "Insurance Search",
  },
  { path: all_routes.search3, element: <Search3 />, meta_title: "Search 3" },
  {
    path: all_routes.search2,
    element: <InsuranceSearch2 />,
    meta_title: "Class Search",
  },

  {
    path: all_routes.dashboards,
    element: <MainDashboard />,
    meta_title: "Dashboards",
  },
  {
    path: all_routes.dashboard1,
    element: <FirstDashboard />,
    meta_title: "Dashboard One",
  },
  {
    path: all_routes.dashboard2,
    element: <SecondDashBoard />,
    meta_title: "Dashboard Two",
  },
  {
    path: all_routes.dashboard3,
    element: <ThirdDashBoard data={[]} />,
    meta_title: "Dashboard Three",
  },
  { path:"/feed", element: <FeedbackForm />, meta_title: "Feedback" },
  { path:"/InsuranceDetails/:insuranceName", element: <InsuranceDetails />, meta_title: "Insurance Details" },
  { path:"/InsuranceBINDetails/:insuranceName", element: <InsuranceBINDetails />, meta_title: "Insurance BIN Details" },
  { path:"/InsurancePCNDetails/:insuranceName", element: <InsurancePCNDetails />, meta_title: "Insurance PCN Details" },
  {path: "/SyncData",element : <SyncData/>,meta_title: "Sync Data"},
  { path: all_routes.DrugPage, element: <DrugPage />, meta_title: "Drug Page" },
  { path: all_routes.home, element: <LandingPage />, meta_title: "Home" },
  { path: "/help", element: <HowItWorksModern />, meta_title: "Help" },
  { path: "/logs", element: <UserActivityLogs />, meta_title: "Logs" },

  {
    path: all_routes.cart,
    element: <CartPageWithContext />,
    meta_title: "Cart",
  },
  {
    path: all_routes.orderHistory,
    element: <OrderHistoryPro />,
    meta_title: "Order History",
  },

  // (examples) wrap lazies with Suspense
  {
    path: all_routes.uiAccordion,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiAccordion />
      </Suspense>
    ),
    meta_title: "Accordion",
  },
  {
    path: all_routes.addPatient,
    element: (
      <Suspense fallback={suspenseFallback}>
        <AddPatient />
      </Suspense>
    ),
    meta_title: "Add Patient",
  },
  {
    path: all_routes.uiAlerts,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiAlerts />
      </Suspense>
    ),
    meta_title: "Alerts",
  },
  {
    path: all_routes.uiAvatar,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiAvatar />
      </Suspense>
    ),
    meta_title: "Avatar",
  },
  {
    path: all_routes.uiBadges,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiBadges />
      </Suspense>
    ),
    meta_title: "Badges",
  },
  {
    path: all_routes.uiBreadcrumb,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiBreadcrumb />
      </Suspense>
    ),
    meta_title: "Breadcrumb",
  },
  {
    path: all_routes.uiButtons,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiButtons />
      </Suspense>
    ),
    meta_title: "Buttons",
  },
  {
    path: all_routes.uiButtonsGroup,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiButtonsGroup />
      </Suspense>
    ),
    meta_title: "Buttons Group",
  },
  {
    path: all_routes.uiCards,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiCards />
      </Suspense>
    ),
    meta_title: "Cards",
  },
  {
    path: all_routes.uiCarousel,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiCarousel />
      </Suspense>
    ),
    meta_title: "Carousel",
  },
  {
    path: all_routes.uiCollapse,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiCollapse />
      </Suspense>
    ),
    meta_title: "Collapse",
  },
  {
    path: all_routes.uiDropdowns,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiDropdowns />
      </Suspense>
    ),
    meta_title: "Dropdowns",
  },
  {
    path: all_routes.uiRatio,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiRatio />
      </Suspense>
    ),
    meta_title: "Ratio",
  },
  {
    path: all_routes.uiGrid,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiGrid />
      </Suspense>
    ),
    meta_title: "Grid",
  },
  {
    path: all_routes.uiImages,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiImages />
      </Suspense>
    ),
    meta_title: "Images",
  },
  {
    path: all_routes.uiLinks,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiLinks />
      </Suspense>
    ),
    meta_title: "Links",
  },
  {
    path: all_routes.uiListGroup,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiListGroup />
      </Suspense>
    ),
    meta_title: "List Group",
  },
  {
    path: all_routes.uiModals,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiModals />
      </Suspense>
    ),
    meta_title: "Modals",
  },
  {
    path: all_routes.uiOffcanvas,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiOffcanvas />
      </Suspense>
    ),
    meta_title: "Offcanvas",
  },
  {
    path: all_routes.uiPagination,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiPagination />
      </Suspense>
    ),
    meta_title: "Pagination",
  },
  {
    path: all_routes.uiPlaceholders,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiPlaceholders />
      </Suspense>
    ),
    meta_title: "Placeholders",
  },
  {
    path: all_routes.uiProgress,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiProgress />
      </Suspense>
    ),
    meta_title: "Progress",
  },
  {
    path: all_routes.uiScrollspy,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiScrollspy />
      </Suspense>
    ),
    meta_title: "Scrollspy",
  },
  {
    path: all_routes.uiSpinner,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiSpinner />
      </Suspense>
    ),
    meta_title: "Spinner",
  },
  {
    path: all_routes.uiNavTabs,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiNavTabs />
      </Suspense>
    ),
    meta_title: "Nav Tabs",
  },
  {
    path: all_routes.uiToasts,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiToasts />
      </Suspense>
    ),
    meta_title: "Toasts",
  },
  {
    path: all_routes.uiTypography,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiTypography />
      </Suspense>
    ),
    meta_title: "Typography",
  },
  {
    path: all_routes.uiTooltips,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiTooltips />
      </Suspense>
    ),
    meta_title: "Tooltips",
  },
  {
    path: all_routes.uiUtilities,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UiUtilities />
      </Suspense>
    ),
    meta_title: "Utilities",
  },

  // (…you can add the rest the same way)
];

// Auth routes
export const authRoutes = [
  {
    path: all_routes.login,
    element: (
      <Suspense fallback={suspenseFallback}>
        <Login />
      </Suspense>
    ),
    meta_title: "Sign In",
  },
  {
    path: all_routes.signUp,
    element: (
      <Suspense fallback={suspenseFallback}>
        <SignUp />
      </Suspense>
    ),
    meta_title: "Sign Up",
  },
  {
    path: all_routes.forgotPassword,
    element: (
      <Suspense fallback={suspenseFallback}>
        <ForgotPassword />
      </Suspense>
    ),
    meta_title: "Forgot Password",
  },
  {
    path: all_routes.changePassword,
    element: (
      <Suspense fallback={suspenseFallback}>
        <ChangePassword />
      </Suspense>
    ),
    meta_title: "Change Password",
  },
  {
    path: all_routes.lockScreen,
    element: (
      <Suspense fallback={suspenseFallback}>
        <LockScreen />
      </Suspense>
    ),
    meta_title: "Lock Screen",
  },
  {
    path: all_routes.error404,
    element: (
      <Suspense fallback={suspenseFallback}>
        <Error404 />
      </Suspense>
    ),
    meta_title: "Error 404",
  },
  {
    path: all_routes.error500,
    element: (
      <Suspense fallback={suspenseFallback}>
        <Error500 />
      </Suspense>
    ),
    meta_title: "Error 500",
  },
  {
    path: all_routes.comingSoon,
    element: (
      <Suspense fallback={suspenseFallback}>
        <ComingSoon />
      </Suspense>
    ),
    meta_title: "Coming Soon",
  },
  {
    path: all_routes.underMaintenance,
    element: (
      <Suspense fallback={suspenseFallback}>
        <UnderMaintenance />
      </Suspense>
    ),
    meta_title: "Under Maintenance",
  },
  {
    path: all_routes.starterPage,
    element: (
      <Suspense fallback={suspenseFallback}>
        <StarterPage />
      </Suspense>
    ),
    meta_title: "Starter Page",
  },
  {
    path: all_routes.privacyPolicy,
    element: (
      <Suspense fallback={suspenseFallback}>
        <PrivacyPolicy />
      </Suspense>
    ),
    meta_title: "Privacy Policy",
  },
  {
    path: all_routes.termsAndConditions,
    element: (
      <Suspense fallback={suspenseFallback}>
        <TermsAndConditions />
      </Suspense>
    ),
    meta_title: "Terms & Conditions",
  },
];
