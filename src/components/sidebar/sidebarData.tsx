import { all_routes } from "../../routes/all_routes";

const route = all_routes;
export const SidebarData = [
  {
    tittle: "MAIN",
    
    submenuItems: [
      {
        label: "Home",
        link: route.home,
        submenu: false,
        icon: "home",
        submenuItems: [],
      },
      
      // داخل مجموعة MAIN → Search
{
  label: "Search",
  title:"search",
   link: "#",
  submenu: true,
  icon: "search",
  submenuItems: [
    { label: "Drug Search", link: route.drugSearch, submenu: false, submenuItems: [] },
    { label: "Insurance Search", link: route.insuranceSearch, submenu: false, submenuItems: [] }, // <-- add this
    { label: "Search By Drug Class", link: route.search2, submenu: false, submenuItems: [] },
    { label: "Search By RXGroup", link: route.search3, submenu: false, submenuItems: [] },    // existing items…



],
 
},
{
  label: "Dashboards",
   link: "#",
  submenu: true,
        icon: "layout-board",
    submenuItems: [
// { label: "Main Dashboard ", link: "/main", submenu: false, submenuItems: [] },

{ label: "All Scripts Audits Dashboard", link: "/dashboard1", submenu: false, submenuItems: [] },
{ label: "Scripts Matched Medisearch Tool Output Audit Dashboard  ", link: "/dashboard2", submenu: false, submenuItems: [] },
{ label: "Scripts Miamatched Medisearch Tool Output Audit Dashboard 3", link: "/dashboard3", submenu: false, submenuItems: [] },

    ]
  },
   {
        label: "Logs",
        link: '/logs',
        submenu: false,
        icon: "history",
        submenuItems: [],
      }, {
        label: "Help & S upport",
        link: '/help',
        submenu: false,
        icon: "help",
        submenuItems: [],
      },
       {
        label: "FeedBack",
        link: '/feed',
        submenu: false,
        icon: "feedback",
        submenuItems: [],
      },
      /*
      {
        label: "Applications",
        link: "#",
        submenu: true,
        icon: "apps",
        submenuItems: [
          { label: "Chat", link: route.chat, submenu: false, submenuItems: [] },
          {
            label: "Calls",
            link: "#",
            submenu: true,
            submenuItems: [
              {
                label: "Voice Call",
                link: route.voiceCall,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Video Call",
                link: route.videoCall,
                submenu: false,
                submenuItems: [],
              },
            ],
          },
          {
            label: "Calendar",
            link: route.calendar,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Email",
            link: route.email,
            relatedRoutes: [
              route.emailCompose,
              route.emailDetails,
            ], 
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Contacts",
            link: route.contacts,
            relatedRoutes: [
              route.contactList,
            ], 
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Invoices",
            link: "#",
            submenu: true,
            submenuItems: [
              {
                label: "Invoices",
                link: route.invoice,
                relatedRoutes: [
                  route.addInvoice,
                  route.editInvoice,
                ], 
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Invoice Details",
                link: route.invoiceDetails,
                submenu: false,
                submenuItems: [],
              },
            ],
          },
          {
            label: "To Do",
            link: route.todo,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Notes",
            link: route.notes,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Kanban Board",
            link: route.kanbanView,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "File Manager",
            link: route.fileManager,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Social Feed",
            link: route.socialFeed,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Search Result",
            link: route.searchResult,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Layouts",
        link: "#",
        submenu: true,
        icon: "layout-kanban",
        submenuItems: [
          {
            label: "Mini",
            link: route.layoutMini,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Hover View",
            link: route.layoutHoverview,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Hidden",
            link: route.layoutHidden,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Full Width",
            link: route.layoutFullwidth,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "RTL",
            link: route.layoutRtl,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Dark",
            link: route.layoutDark,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      */
    ],
  },
  /*
  {
    tittle: "Healthcare",
    submenuItems: [
      {
        label: "Patients",
        link: route.patients,
        relatedRoutes: [
          route.addPatient,
          route.editPatient,
          route.allPatientsList,
          route.patientDetails,
          route.patientDetailsAppointment,
          route.patientDetailsVitalSign,
          route.patientDetailsVisitHistory,
          route.patientDetailsLabResults,
          route.patientdetailsPrescription,
          route.patientetailsMedicalHistory,
          route.patientetailsDocuments,
        ], 
        submenu: false,
        icon: "users",
        submenuItems: [],
      },
      {
        label: "Doctors",
        link: route.doctors,
        relatedRoutes: [
          route.allDoctorsList,
          route.doctorDetails,
          route.addDoctors,
          route.editDoctors,
        ], 
        submenu: false,
        icon: "stethoscope",
        submenuItems: [],
      },
      {
        label: "Appointments",
        link: route.appointments,
         relatedRoutes: [
          route.appointmentConsultation,
         
        ], 
        submenu: false,
        icon: "calendar-time",
        submenuItems: [],
      },
      {
        label: "Visits",
        link: route.visits,
         relatedRoutes: [
          route.startVisits,
         
        ], 
        submenu: false,
        icon: "e-passport",
        submenuItems: [],
      },
      {
        label: "Laboratory",
        link: "#",
        submenu: true,
        icon: "test-pipe",
        submenuItems: [
          {
            label: "Lab Results",
            link: route.labResults,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Medical Rsults",
            link: route.medicalResults,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Pharmacy",
        link: route.pharmacy,
        submenu: false,
        icon: "prescription",
        submenuItems: [],
      },
    ],
  },
  {
    tittle: "MANAGE",
    submenuItems: [
      {
        label: "Staff",
        link: route.staff,
        submenu: false,
        icon: "users-group",
        submenuItems: [],
      },
      {
        label: "Notifications",
        link: route.notifications,
        submenu: false,
        icon: "bell",
        submenuItems: [],
      },
      {
        label: "Settings",
        link: route.generalSettings,
        relatedRoutes: [
          route.generalSettings,
          route.securitySettings,
          route.preferencesSettings,
          route.appearanceSettings,
          route.notificationsSettings,
          route.userPermissionsSettings,
          route.plansBillingsSettings,
        ],
        submenu: false,
        icon: "settings",
        submenuItems: [],
      },
    ],
  },
  {
    tittle: "PAGES",
    submenuItems: [
      {
        label: "Authentication",
        link: "#",
        submenu: true,
        icon: "lock-square-rounded",
        submenuItems: [
          {
            label: "Login",
            link: route.login,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Sign Up",
            link: route.signUp,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Forgot Password",
            link: route.forgotPassword,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Change Password",
            link: route.changePassword,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Lock Screen",
            link: route.lockScreen,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Error Pages",
        link: "#",
        submenu: true,
        icon: "face-id-error",
        submenuItems: [
          {
            label: "Error 404",
            link: route.error404,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Error 500",
            link: route.error500,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Other Pages",
        link: "#",
        submenu: true,
        icon: "files",
        submenuItems: [
          {
            label: "Starter Page",
            link: route.starterPage,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Coming Soon",
            link: route.comingSoon,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Under Maintenance",
            link: route.underMaintenance,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Privacy Policy",
            link: route.privacyPolicy,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Terms & Conditions",
            link: route.termsAndConditions,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
    ],
  },
  {
    tittle: "UI Interface",
    submenuItems: [
      {
        label: "Base UI",
        link: "#",
        submenu: true,
        icon: "hierarchy",
        submenuItems: [
          {
            label: "Accordion",
            link: route.uiAccordion,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Alerts",
            link: route.uiAlerts,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Avatar",
            link: route.uiAvatar,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Badges",
            link: route.uiBadges,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Breadcrumb",
            link: route.uiBreadcrumb,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Buttons",
            link: route.uiButtons,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Button Group",
            link: route.uiButtonsGroup,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Card",
            link: route.uiCards,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Carousel",
            link: route.uiCarousel,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Collapse",
            link: route.uiCollapse,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Dropdowns",
            link: route.uiDropdowns,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Ratio",
            link: route.uiRatio,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Grid",
            link: route.uiGrid,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Images",
            link: route.uiImages,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Links",
            link: route.uiLinks,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "List Group",
            link: route.uiListGroup,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Modals",
            link: route.uiModals,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Offcanvas",
            link: route.uiOffcanvas,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Pagination",
            link: route.uiPagination,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Placeholders",
            link: route.uiPlaceholders,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Progress",
            link: route.uiProgress,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Scrollspy",
            link: route.uiScrollspy,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Spinner",
            link: route.uiSpinner,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Tabs",
            link: route.uiNavTabs,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Toasts",
            link: route.uiToasts,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Tooltips",
            link: route.uiTooltips,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Typography",
            link: route.uiTypography,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Utilities",
            link: route.uiUtilities,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Advanced UI",
        link: "#",
        submenu: true,
        icon: "whirl",
        submenuItems: [
          {
            label: "Dragula",
            link: route.uiDragula,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Clipboard",
            link: route.uiClipboard,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Range Slider",
            link: route.uiRangeslider,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Lightbox",
            link: route.uiLightbox,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Rating",
            link: route.uiRating,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Scrollbar",
            link: route.uiScrollbar,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Forms",
        link: "#",
        submenu: true,
        icon: "forms",
        submenuItems: [
          {
            label: "Form Elements",
            link: "#",
            submenu: true,
            submenuItems: [
              {
                label: "Basic Inputs",
                link: route.formBasicInputs,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Checkbox & Radios",
                link: route.formCheckboxRadios,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Input Groups",
                link: route.formInputGroups,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Grid & Gutters",
                link: route.formGridGutters,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Input Masks",
                link: route.formMask,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "File Uploads",
                link: route.formFileupload,
                submenu: false,
                submenuItems: [],
              },
            ],
          },
          {
            label: "Layouts",
            link: "#",
            submenu: true,
            submenuItems: [
              {
                label: "Horizontal Form",
                link: route.formHorizontal,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Vertical Form",
                link: route.formVertical,
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Floating Labels",
                link: route.formFloatingLabels,
                submenu: false,
                submenuItems: [],
              },
            ],
          },
          {
            label: "Form Validation",
            link: route.formValidation,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Form Select",
            link: route.formSelect,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Form Wizard",
            link: route.formWizard,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Form Picker",
            link: route.formPickers,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Tables",
        link: "#",
        submenu: true,
        icon: "table",
        submenuItems: [
          {
            label: "Basic Tables",
            link: route.tablesBasic,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Data Table",
            link: route.dataTables,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Charts",
        link: "#",
        submenu: true,
        icon: "chart-pie-3",
        submenuItems: [
          {
            label: "Apex Charts",
            link: route.chartApex,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Icons",
        link: "#",
        submenu: true,
        icon: "icons",
        submenuItems: [
          {
            label: "Fontawesome Icons",
            link: route.iconFontawesome,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Tabler Icons",
            link: route.iconTabler,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Bootstrap Icons",
            link: route.iconBootstrap,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Remix Icons",
            link: route.iconRemix,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Ionic Icons",
            link: route.iconIonic,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Material Icons",
            link: route.iconMaterial,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Pe7 Icons",
            link: route.iconPe7,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Weather Icons",
            link: route.iconWeather,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Typicon Icons",
            link: route.iconTypicon,
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Flag Icons",
            link: route.iconFlag,
            submenu: false,
            submenuItems: [],
          },
        ],
      },
      {
        label: "Widgets",
        link: route.widgets,
        submenu: false,
        icon: "components",
        submenuItems: [],
      },
    ],
  },
  {
    tittle: "HELP",
    submenuItems: [
      {
        label: "Documentation",
        link: route.documentation,
        submenu: false,
        icon: "file-type-doc",
        submenuItems: [],
      },
      
      {
        label: "Multi Level",
        link: "#",
        submenu: true,
        icon: "menu-order",
        submenuItems: [
          {
            label: "Multilevel 1",
            link: "#",
            submenu: false,
            submenuItems: [],
          },
          {
            label: "Multilevel 2",
            link: "#",
            submenu: true,
            submenuItems: [
              {
                label: "Multilevel 2.1",
                link: "#",
                submenu: false,
                submenuItems: [],
              },
              {
                label: "Multilevel 2.2",
                link: "#",
                submenu: true,
                submenuItems: [
                  {
                    label: "Multilevel 2.2.1",
                    link: "#",
                    submenu: false,
                    submenuItems: [],
                  },
                  {
                    label: "Multilevel 2.2.2",
                    link: "#",
                    submenu: false,
                    submenuItems: [],
                  },
                ],
              },
            ],
          },
          {
            label: "Multilevel 3",
            link: "#",
            submenu: false,
            submenuItems: [],
          },
        ],
      },
    ],
  },
  */
];
