

import { Page, Locator, expect } from '@playwright/test';

// Fuente única para la URL base usada por Page Objects en contextos sin baseURL
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://bruceapp.onrender.com';


export class CultivoPage {
  readonly page: Page;
  
  // === ELEMENTOS PRINCIPALES DE LA PÁGINA ===
 
  readonly cultivoMainWrapper: Locator;
  
  // === HERO SECTION ===
  readonly cultivoHero: Locator;
  readonly cultivoHeroCenter: Locator;
  readonly cultivoHeroBadge: Locator;
  readonly cultivoHeroBadgeEmoji: Locator;
  readonly cultivoPageTitle: Locator;
  readonly cultivoPageTitleHighlight: Locator;
  readonly cultivoHeroDesc: Locator;
  readonly cultivoHeroStats: Locator;
  readonly cultivoHeroStatTotal: Locator;
  readonly cultivoHeroStatTotalN: Locator;
  readonly cultivoHeroStatTotalLabel: Locator;
  readonly cultivoHeroStatActivos: Locator;
  readonly cultivoHeroStatActivosN: Locator;
  readonly cultivoHeroStatActivosLabel: Locator;
  readonly cultivoHeroStatM2: Locator;
  readonly cultivoHeroStatM2N: Locator;
  readonly cultivoHeroStatM2Label: Locator;
  readonly cultivoHeroStatPlantas: Locator;
  readonly cultivoHeroStatPlantasN: Locator;
  readonly cultivoHeroStatPlantasLabel: Locator;
  
  // === TABS NAVIGATION ===
  readonly cultivoTabsContainer: Locator;
  readonly cultivoTabsBar: Locator;
  readonly cultivoTabCultivos: Locator;
  readonly cultivoTabCultivosEmoji: Locator;
  readonly cultivoTabPlanificacion: Locator;
  readonly cultivoTabPlanificacionEmoji: Locator;
  
  // === TOOLBAR Y CONTROLES ===
  readonly cultivoToolbar: Locator;
  readonly cultivoToolbarInner: Locator;
  readonly cultivoSearchForm: Locator;
  readonly cultivoSearchInputWrapper: Locator;
  readonly cultivoSearchInput: Locator;
  readonly cultivoSearchIconWrapper: Locator;
  readonly cultivoSearchIcon: Locator;
  readonly cultivoSearchButton: Locator;
  readonly cultivoListControls: Locator;
  readonly cultivoFiltroSelect: Locator;
  readonly cultivoFiltroSelectTodos: Locator;
  readonly cultivoFiltroSelectActivos: Locator;
  readonly cultivoFiltroSelectInactivos: Locator;
  readonly cultivoOrderToggle: Locator;
  readonly cultivoOrderToggleIcon: Locator;
  readonly cultivoNewButton: Locator;
  readonly cultivoNewButtonIcon: Locator;
  readonly cultivoNewDisabledMessage: Locator;
  
  // === FORMULARIOS ===
  readonly cultivoFormWrapper: Locator;
  readonly cultivoFormHeader: Locator;
  readonly cultivoFormIconCrear: Locator;
  readonly cultivoFormIconEditar: Locator;
  readonly cultivoFormPlusIcon: Locator;
  readonly cultivoFormEditIcon: Locator;
  readonly cultivoFormTitle: Locator;
  readonly cultivoFormDesc: Locator;
  readonly cultivoForm: Locator;
  
  // === LISTA DE CULTIVOS ===
  readonly cultivoList: Locator;
  readonly cultivoListLoading: Locator;
  readonly cultivoListLoadingSpinner: Locator;
  readonly cultivoListError: Locator;
  readonly cultivoListErrorIcon: Locator;
  readonly cultivoListErrorText: Locator;
  readonly cultivoListEmpty: Locator;
  readonly cultivoListEmptyIcon: Locator;
  readonly cultivoListEmptyLabel: Locator;
  readonly cultivoListEmptyDesc: Locator;
  readonly cultivoListCreatefirstButton: Locator;
  readonly cultivoListEmptyAdminonly: Locator;
  readonly cultivoListEmptyRol: Locator;
  readonly cultivoCardsList: Locator;
  
  // === CARDS DE CULTIVOS ===
  readonly cultivoCard: Locator;
  readonly cultivoCardHeader: Locator;
  readonly cultivoCardNombre: Locator;
  readonly cultivoCardEstado: Locator;
  readonly cultivoCardGenetica: Locator;
  readonly cultivoCardContent: Locator;
  readonly cultivoCardM2: Locator;
  readonly cultivoCardPlantas: Locator;
  readonly cultivoCardInicio: Locator;
  readonly cultivoCardSustrato: Locator;
  readonly cultivoCardActions: Locator;
  readonly cultivoCardVerdetalles: Locator;
  readonly cultivoCardEditar: Locator;
  readonly cultivoCardEliminar: Locator;
  
  // === PESTAÑA PLANIFICACIÓN ===
  readonly cultivoPlanificacionWrapper: Locator;
  readonly cultivoCalendario: Locator;
  readonly cultivoGestionTareas: Locator;
  
  // === MODAL DE TAREA ===
  readonly cultivoTareaModalBackdrop: Locator;
  readonly cultivoTareaModal: Locator;
  readonly cultivoTareaModalContent: Locator;
  readonly cultivoTareaModalHeader: Locator;
  readonly cultivoTareaModalTitle: Locator;
  readonly cultivoTareaModalSubtitle: Locator;
  readonly cultivoTareaModalClose: Locator;
  readonly cultivoTareaModalCloseIcon: Locator;
  readonly cultivoTareaModalBody: Locator;
  readonly cultivoTareaModalFieldsRow: Locator;
  readonly cultivoTareaModalTitulo: Locator;
  readonly cultivoTareaModalTipo: Locator;
  readonly cultivoTareaModalPrioridad: Locator;
  readonly cultivoTareaModalEstadoWrap: Locator;
  readonly cultivoTareaModalEstado: Locator;
  readonly cultivoTareaModalDesc: Locator;
  readonly cultivoTareaModalInfoGrid: Locator;
  readonly cultivoTareaModalFechaProgramadaWrap: Locator;
  readonly cultivoTareaModalFechaProgramada: Locator;
  readonly cultivoTareaModalHoraProgramadaWrap: Locator;
  readonly cultivoTareaModalHoraProgramada: Locator;
  readonly cultivoTareaModalDuracionEstimadaWrap: Locator;
  readonly cultivoTareaModalDuracionEstimada: Locator;
  readonly cultivoTareaModalEsRecurrenteWrap: Locator;
  readonly cultivoTareaModalEsRecurrente: Locator;
  readonly cultivoTareaModalRecordatorioWrap: Locator;
  readonly cultivoTareaModalRecordatorio: Locator;
  readonly cultivoTareaModalActions: Locator;
  readonly cultivoTareaModalEditar: Locator;
  readonly cultivoTareaModalCerrar: Locator;

  // === ELEMENTOS DE PÁGINA INDIVIDUAL (/cultivo/[id]) ===
  // Loading y Error States
  readonly cultivoMainLoading: Locator;
  readonly cultivoLoadingBox: Locator;
  readonly cultivoLoadingSpinner: Locator;
  readonly cultivoLoadingText: Locator;
  readonly cultivoMainError: Locator;
  readonly cultivoErrorBox: Locator;
  readonly cultivoErrorIcon: Locator;
  readonly cultivoErrorTitle: Locator;
  readonly cultivoErrorDesc: Locator;
  readonly cultivoErrorVolver: Locator;
  
  // Header y navegación
  readonly cultivoMain: Locator;
  readonly cultivoMainContent: Locator;
  readonly cultivoHeader: Locator;
  readonly cultivoVolverLink: Locator;
  readonly cultivoVolverIcon: Locator;
  readonly cultivoNombre: Locator;
  readonly cultivoGeneticaHeader: Locator;
  readonly cultivoEstadoChip: Locator;
  readonly cultivoEditarBoton: Locator;
  readonly cultivoEditarIcon: Locator;
  readonly cultivoToggleEstadoBoton: Locator;
  readonly cultivoEliminarBoton: Locator;
  readonly cultivoEliminarIcon: Locator;
  
  // Tabs de navegación individual
  readonly cultivoTabsNav: Locator;
  readonly cultivoTabDetalles: Locator;
  readonly cultivoTabChat: Locator;
  readonly cultivoTabComentarios: Locator;
  readonly cultivoTabGaleria: Locator;
  readonly cultivoTabPlanificacionIndividual: Locator;
  
  // Formulario de edición
  readonly cultivoFormEdicionBox: Locator;
  readonly cultivoFormEdicionIcon: Locator;
  readonly cultivoFormEdicionTitle: Locator;
  readonly cultivoFormEdicionNote: Locator;
  readonly cultivoFormEdicion: Locator;
  
  // Grid de detalles
  readonly cultivoDetallesGrid: Locator;
  readonly cultivoInfoBasica: Locator;
  readonly cultivoInfoSustrato: Locator;
  readonly cultivoInfoGenetica: Locator;
  readonly cultivoInfoFechaComienzo: Locator;
  readonly cultivoInfoEstado: Locator;
  readonly cultivoInfoTecnica: Locator;
  readonly cultivoInfoArea: Locator;
  readonly cultivoInfoNumeroPlantas: Locator;
  readonly cultivoInfoLitrosMaceta: Locator;
  readonly cultivoInfoPotenciaLamparas: Locator;
  readonly cultivoInfoCreacion: Locator;
  readonly cultivoInfoActualizacion: Locator;
  readonly cultivoInfoAdicional: Locator;
  readonly cultivoEstadoMain: Locator;
  readonly cultivoEstadoFaseactual: Locator;
  readonly cultivoEstadoDiasVegetacion: Locator;
  readonly cultivoEstadoDiasFloracion: Locator;
  readonly cultivoEstadoSemanaactual: Locator;
  readonly cultivoIniciarFloracionBox: Locator;
  readonly cultivoIniciarFloracionBoton: Locator;
  readonly cultivoInicioFechaFloracion: Locator;
  readonly cultivoInfoRecomendaciones: Locator;
  readonly cultivoRecomendacionPh: Locator;
  readonly cultivoRecomendacionEc: Locator;
  readonly cultivoRecomendacionAgua: Locator;
  readonly cultivoRecomendacionEmpty: Locator;
  readonly cultivoInfoCondiciones: Locator;
  readonly cultivoCondicionesVegetacion: Locator;
  readonly cultivoCondicionesFloracion: Locator;
  readonly cultivoCondicionesEmpty: Locator;
  readonly cultivoNotas: Locator;
  readonly cultivoNotasCuerpo: Locator;
  
  // Panel lateral
  readonly cultivoPanelLateral: Locator;
  readonly cultivoMetricasBox: Locator;
  readonly cultivoMetricasDiasInicio: Locator;
  readonly cultivoMetricasPlantasM2: Locator;
  readonly cultivoMetricasWattsM2: Locator;
  readonly cultivoMetricasLitrosTotales: Locator;
  readonly cultivoAccionesRapidasBox: Locator;
  readonly cultivoAccionEditar: Locator;
  readonly cultivoAccionToggleEstado: Locator;
  
  // Vistas de tabs individuales
  readonly cultivoTabviewChat: Locator;
  readonly cultivoTabviewComentarios: Locator;
  readonly cultivoTabviewGaleria: Locator;
  readonly cultivoTabviewPlanificacion: Locator;
  
  // Modal de tarea individual
  readonly cultivoModalTareaOverlay: Locator;
  readonly cultivoModalTarea: Locator;
  readonly cultivoModalTareaTitle: Locator;
  readonly cultivoModalTareaDesc: Locator;
  readonly cultivoModalTareaCerrarX: Locator;
  readonly cultivoModalTareaBody: Locator;
  readonly cultivoModalTareaTitulo: Locator;
  readonly cultivoModalTareaTipo: Locator;
  readonly cultivoModalTareaPrioridad: Locator;
  readonly cultivoModalTareaEstado: Locator;
  readonly cultivoModalTareaDescripcion: Locator;
  readonly cultivoModalTareaInfo: Locator;
  readonly cultivoModalTareaFecha: Locator;
  readonly cultivoModalTareaHora: Locator;
  readonly cultivoModalTareaDuracion: Locator;
  readonly cultivoModalTareaRecurrente: Locator;
  readonly cultivoModalTareaRecordatorio: Locator;
  readonly cultivoModalTareaEditar: Locator;
  readonly cultivoModalTareaCerrar: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // === ELEMENTOS PRINCIPALES DE LA PÁGINA ===
   
    this.cultivoMainWrapper = page.getByTestId('cultivo-main-wrapper');
    
    // === HERO SECTION ===
    this.cultivoHero = page.getByTestId('cultivo-hero');
    this.cultivoHeroCenter = page.getByTestId('cultivo-hero-center');
    this.cultivoHeroBadge = page.getByTestId('cultivo-hero-badge');
    this.cultivoHeroBadgeEmoji = page.getByTestId('cultivo-hero-badge-emoji');
    this.cultivoPageTitle = page.getByTestId('cultivo-page-title');
    this.cultivoPageTitleHighlight = page.getByTestId('cultivo-page-title-highlight');
    this.cultivoHeroDesc = page.getByTestId('cultivo-hero-desc');
    this.cultivoHeroStats = page.getByTestId('cultivo-hero-stats');
    this.cultivoHeroStatTotal = page.getByTestId('cultivo-hero-stat-total');
    this.cultivoHeroStatTotalN = page.getByTestId('cultivo-hero-stat-total-n');
    this.cultivoHeroStatTotalLabel = page.getByTestId('cultivo-hero-stat-total-label');
    this.cultivoHeroStatActivos = page.getByTestId('cultivo-hero-stat-activos');
    this.cultivoHeroStatActivosN = page.getByTestId('cultivo-hero-stat-activos-n');
    this.cultivoHeroStatActivosLabel = page.getByTestId('cultivo-hero-stat-activos-label');
    this.cultivoHeroStatM2 = page.getByTestId('cultivo-hero-stat-m2');
    this.cultivoHeroStatM2N = page.getByTestId('cultivo-hero-stat-m2-n');
    this.cultivoHeroStatM2Label = page.getByTestId('cultivo-hero-stat-m2-label');
    this.cultivoHeroStatPlantas = page.getByTestId('cultivo-hero-stat-plantas');
    this.cultivoHeroStatPlantasN = page.getByTestId('cultivo-hero-stat-plantas-n');
    this.cultivoHeroStatPlantasLabel = page.getByTestId('cultivo-hero-stat-plantas-label');
    
    // === TABS NAVIGATION ===
    this.cultivoTabsContainer = page.getByTestId('cultivo-tabs-container');
    this.cultivoTabsBar = page.getByTestId('cultivo-tabs-bar');
    this.cultivoTabCultivos = page.getByTestId('cultivo-tab-cultivos');
    this.cultivoTabCultivosEmoji = page.getByTestId('cultivo-tab-cultivos-emoji');
    this.cultivoTabPlanificacion = page.getByTestId('cultivo-tab-planificacion');
    this.cultivoTabPlanificacionEmoji = page.getByTestId('cultivo-tab-planificacion-emoji');
    
    // === TOOLBAR Y CONTROLES ===
    this.cultivoToolbar = page.getByTestId('cultivo-toolbar');
    this.cultivoToolbarInner = page.getByTestId('cultivo-toolbar-inner');
    this.cultivoSearchForm = page.getByTestId('cultivo-search-form');
    this.cultivoSearchInputWrapper = page.getByTestId('cultivo-search-input-wrapper');
    this.cultivoSearchInput = page.getByTestId('cultivo-search-input');
    this.cultivoSearchIconWrapper = page.getByTestId('cultivo-search-icon-wrapper');
    this.cultivoSearchIcon = page.getByTestId('cultivo-search-icon');
    this.cultivoSearchButton = page.getByTestId('cultivo-search-button');
    this.cultivoListControls = page.getByTestId('cultivo-list-controls');
    this.cultivoFiltroSelect = page.getByTestId('cultivo-filtro-select');
    this.cultivoFiltroSelectTodos = page.getByTestId('cultivo-filtro-select-todos');
    this.cultivoFiltroSelectActivos = page.getByTestId('cultivo-filtro-select-activos');
    this.cultivoFiltroSelectInactivos = page.getByTestId('cultivo-filtro-select-inactivos');
    this.cultivoOrderToggle = page.getByTestId('cultivo-order-toggle');
    this.cultivoOrderToggleIcon = page.getByTestId('cultivo-order-toggle-icon');
    this.cultivoNewButton = page.getByTestId('cultivo-new-button');
    this.cultivoNewButtonIcon = page.getByTestId('cultivo-new-button-icon');
    this.cultivoNewDisabledMessage = page.getByTestId('cultivo-new-disabled-message');
    
    // === FORMULARIOS ===
    this.cultivoFormWrapper = page.getByTestId('cultivo-form-wrapper');
    this.cultivoFormHeader = page.getByTestId('cultivo-form-header');
    this.cultivoFormIconCrear = page.getByTestId('cultivo-form-icon-crear');
    this.cultivoFormIconEditar = page.getByTestId('cultivo-form-icon-editar');
    this.cultivoFormPlusIcon = page.getByTestId('cultivo-form-plus-icon');
    this.cultivoFormEditIcon = page.getByTestId('cultivo-form-edit-icon');
    this.cultivoFormTitle = page.getByTestId('cultivo-form-title');
    this.cultivoFormDesc = page.getByTestId('cultivo-form-desc');
    this.cultivoForm = page.getByTestId('cultivo-form');
    
    // === LISTA DE CULTIVOS ===
    this.cultivoList = page.getByTestId('cultivo-list');
    this.cultivoListLoading = page.getByTestId('cultivo-list-loading');
    this.cultivoListLoadingSpinner = page.getByTestId('cultivo-list-loading-spinner');
    this.cultivoListError = page.getByTestId('cultivo-list-error');
    this.cultivoListErrorIcon = page.getByTestId('cultivo-list-error-icon');
    this.cultivoListErrorText = page.getByTestId('cultivo-list-error-text');
    this.cultivoListEmpty = page.getByTestId('cultivo-list-empty');
    this.cultivoListEmptyIcon = page.getByTestId('cultivo-list-empty-icon');
    this.cultivoListEmptyLabel = page.getByTestId('cultivo-list-empty-label');
    this.cultivoListEmptyDesc = page.getByTestId('cultivo-list-empty-desc');
    this.cultivoListCreatefirstButton = page.getByTestId('cultivo-list-createfirst-button');
    this.cultivoListEmptyAdminonly = page.getByTestId('cultivo-list-empty-adminonly');
    this.cultivoListEmptyRol = page.getByTestId('cultivo-list-empty-rol');
    this.cultivoCardsList = page.getByTestId('cultivo-cards-list');
    
    // === CARDS DE CULTIVOS (usando selector genérico) ===
    this.cultivoCard = page.locator('[data-testid^="cultivo-card-"]');
    this.cultivoCardHeader = page.locator('[data-testid^="cultivo-card-header-"]');
    this.cultivoCardNombre = page.locator('[data-testid^="cultivo-card-nombre-"]');
    this.cultivoCardEstado = page.locator('[data-testid^="cultivo-card-estado-"]');
    this.cultivoCardGenetica = page.locator('[data-testid^="cultivo-card-genetica-"]');
    this.cultivoCardContent = page.locator('[data-testid^="cultivo-card-content-"]');
    this.cultivoCardM2 = page.locator('[data-testid^="cultivo-card-m2-"]');
    this.cultivoCardPlantas = page.locator('[data-testid^="cultivo-card-plantas-"]');
    this.cultivoCardInicio = page.locator('[data-testid^="cultivo-card-inicio-"]');
    this.cultivoCardSustrato = page.locator('[data-testid^="cultivo-card-sustrato-"]');
    this.cultivoCardActions = page.locator('[data-testid^="cultivo-card-actions-"]');
    this.cultivoCardVerdetalles = page.locator('[data-testid^="cultivo-card-verdetalles-"]');
    this.cultivoCardEditar = page.locator('[data-testid^="cultivo-card-editar-"]');
    this.cultivoCardEliminar = page.locator('[data-testid^="cultivo-card-eliminar-"]');
    
    // === PESTAÑA PLANIFICACIÓN ===
    this.cultivoPlanificacionWrapper = page.getByTestId('cultivo-planificacion-wrapper');
    this.cultivoCalendario = page.getByTestId('cultivo-calendario');
    this.cultivoGestionTareas = page.getByTestId('cultivo-gestion-tareas');
    
    // === MODAL DE TAREA ===
    this.cultivoTareaModalBackdrop = page.getByTestId('cultivo-tarea-modal-backdrop');
    this.cultivoTareaModal = page.getByTestId('cultivo-tarea-modal');
    this.cultivoTareaModalContent = page.getByTestId('cultivo-tarea-modal-content');
    this.cultivoTareaModalHeader = page.getByTestId('cultivo-tarea-modal-header');
    this.cultivoTareaModalTitle = page.getByTestId('cultivo-tarea-modal-title');
    this.cultivoTareaModalSubtitle = page.getByTestId('cultivo-tarea-modal-subtitle');
    this.cultivoTareaModalClose = page.getByTestId('cultivo-tarea-modal-close');
    this.cultivoTareaModalCloseIcon = page.getByTestId('cultivo-tarea-modal-close-icon');
    this.cultivoTareaModalBody = page.getByTestId('cultivo-tarea-modal-body');
    this.cultivoTareaModalFieldsRow = page.getByTestId('cultivo-tarea-modal-fields-row');
    this.cultivoTareaModalTitulo = page.getByTestId('cultivo-tarea-modal-titulo');
    this.cultivoTareaModalTipo = page.getByTestId('cultivo-tarea-modal-tipo');
    this.cultivoTareaModalPrioridad = page.getByTestId('cultivo-tarea-modal-prioridad');
    this.cultivoTareaModalEstadoWrap = page.getByTestId('cultivo-tarea-modal-estado-wrap');
    this.cultivoTareaModalEstado = page.getByTestId('cultivo-tarea-modal-estado');
    this.cultivoTareaModalDesc = page.getByTestId('cultivo-tarea-modal-desc');
    this.cultivoTareaModalInfoGrid = page.getByTestId('cultivo-tarea-modal-info-grid');
    this.cultivoTareaModalFechaProgramadaWrap = page.getByTestId('cultivo-tarea-modal-fecha-programada-wrap');
    this.cultivoTareaModalFechaProgramada = page.getByTestId('cultivo-tarea-modal-fecha-programada');
    this.cultivoTareaModalHoraProgramadaWrap = page.getByTestId('cultivo-tarea-modal-hora-programada-wrap');
    this.cultivoTareaModalHoraProgramada = page.getByTestId('cultivo-tarea-modal-hora-programada');
    this.cultivoTareaModalDuracionEstimadaWrap = page.getByTestId('cultivo-tarea-modal-duracion-estimada-wrap');
    this.cultivoTareaModalDuracionEstimada = page.getByTestId('cultivo-tarea-modal-duracion-estimada');
    this.cultivoTareaModalEsRecurrenteWrap = page.getByTestId('cultivo-tarea-modal-es-recurrente-wrap');
    this.cultivoTareaModalEsRecurrente = page.getByTestId('cultivo-tarea-modal-es-recurrente');
    this.cultivoTareaModalRecordatorioWrap = page.getByTestId('cultivo-tarea-modal-recordatorio-wrap');
    this.cultivoTareaModalRecordatorio = page.getByTestId('cultivo-tarea-modal-recordatorio');
    this.cultivoTareaModalActions = page.getByTestId('cultivo-tarea-modal-actions');
    this.cultivoTareaModalEditar = page.getByTestId('cultivo-tarea-modal-editar');
    this.cultivoTareaModalCerrar = page.getByTestId('cultivo-tarea-modal-cerrar');

    // === ELEMENTOS DE PÁGINA INDIVIDUAL (/cultivo/[id]) ===
    // Loading y Error States
    this.cultivoMainLoading = page.getByTestId('cultivo-main-loading');
    this.cultivoLoadingBox = page.getByTestId('cultivo-loading-box');
    this.cultivoLoadingSpinner = page.getByTestId('cultivo-loading-spinner');
    this.cultivoLoadingText = page.getByTestId('cultivo-loading-text');
    this.cultivoMainError = page.getByTestId('cultivo-main-error');
    this.cultivoErrorBox = page.getByTestId('cultivo-error-box');
    this.cultivoErrorIcon = page.getByTestId('cultivo-error-icon');
    this.cultivoErrorTitle = page.getByTestId('cultivo-error-title');
    this.cultivoErrorDesc = page.getByTestId('cultivo-error-desc');
    this.cultivoErrorVolver = page.getByTestId('cultivo-error-volver');
    
    // Header y navegación
    this.cultivoMain = page.getByTestId('cultivo-main');
    this.cultivoMainContent = page.getByTestId('cultivo-main-content');
    this.cultivoHeader = page.getByTestId('cultivo-header');
    this.cultivoVolverLink = page.getByTestId('cultivo-volver-link');
    this.cultivoVolverIcon = page.getByTestId('cultivo-volver-icon');
    this.cultivoNombre = page.getByTestId('cultivo-nombre');
    this.cultivoGeneticaHeader = page.getByTestId('cultivo-genetica-header');
    this.cultivoEstadoChip = page.getByTestId('cultivo-estado-chip');
    this.cultivoEditarBoton = page.getByTestId('cultivo-editar-boton');
    this.cultivoEditarIcon = page.getByTestId('cultivo-editar-icon');
    this.cultivoToggleEstadoBoton = page.getByTestId('cultivo-toggle-estado-boton');
    this.cultivoEliminarBoton = page.getByTestId('cultivo-eliminar-boton');
    this.cultivoEliminarIcon = page.getByTestId('cultivo-eliminar-icon');
    
    // Tabs de navegación individual
    this.cultivoTabsNav = page.getByTestId('cultivo-tabs-nav');
    this.cultivoTabDetalles = page.getByTestId('cultivo-tab-detalles');
    this.cultivoTabChat = page.getByTestId('cultivo-tab-chat');
    this.cultivoTabComentarios = page.getByTestId('cultivo-tab-comentarios');
    this.cultivoTabGaleria = page.getByTestId('cultivo-tab-galeria');
    this.cultivoTabPlanificacionIndividual = page.getByTestId('cultivo-tab-planificacion');
    
    // Formulario de edición
    this.cultivoFormEdicionBox = page.getByTestId('cultivo-form-edicion-box');
    this.cultivoFormEdicionIcon = page.getByTestId('cultivo-form-edicion-icon');
    this.cultivoFormEdicionTitle = page.getByTestId('cultivo-form-edicion-title');
    this.cultivoFormEdicionNote = page.getByTestId('cultivo-form-edicion-note');
    this.cultivoFormEdicion = page.getByTestId('cultivo-form-edicion');
    
    // Grid de detalles
    this.cultivoDetallesGrid = page.getByTestId('cultivo-detalles-grid');
    this.cultivoInfoBasica = page.getByTestId('cultivo-info-basica');
    this.cultivoInfoSustrato = page.getByTestId('cultivo-info-sustrato');
    this.cultivoInfoGenetica = page.getByTestId('cultivo-info-genetica');
    this.cultivoInfoFechaComienzo = page.getByTestId('cultivo-info-fechaComienzo');
    this.cultivoInfoEstado = page.getByTestId('cultivo-info-estado');
    this.cultivoInfoTecnica = page.getByTestId('cultivo-info-tecnica');
    this.cultivoInfoArea = page.getByTestId('cultivo-info-area');
    this.cultivoInfoNumeroPlantas = page.getByTestId('cultivo-info-numero-plantas');
    this.cultivoInfoLitrosMaceta = page.getByTestId('cultivo-info-litros-maceta');
    this.cultivoInfoPotenciaLamparas = page.getByTestId('cultivo-info-potencia-lamparas');
    this.cultivoInfoCreacion = page.getByTestId('cultivo-info-creacion');
    this.cultivoInfoActualizacion = page.getByTestId('cultivo-info-actualizacion');
    this.cultivoInfoAdicional = page.getByTestId('cultivo-info-adicional');
    this.cultivoEstadoMain = page.getByTestId('cultivo-estado-main');
    this.cultivoEstadoFaseactual = page.getByTestId('cultivo-estado-faseactual');
    this.cultivoEstadoDiasVegetacion = page.getByTestId('cultivo-estado-dias-vegetacion');
    this.cultivoEstadoDiasFloracion = page.getByTestId('cultivo-estado-dias-floracion');
    this.cultivoEstadoSemanaactual = page.getByTestId('cultivo-estado-semanaactual');
    this.cultivoIniciarFloracionBox = page.getByTestId('cultivo-iniciar-floracion-box');
    this.cultivoIniciarFloracionBoton = page.getByTestId('cultivo-iniciar-floracion-boton');
    this.cultivoInicioFechaFloracion = page.getByTestId('cultivo-inicio-fecha-floracion');
    this.cultivoInfoRecomendaciones = page.getByTestId('cultivo-info-recomendaciones');
    this.cultivoRecomendacionPh = page.getByTestId('cultivo-recomendacion-ph');
    this.cultivoRecomendacionEc = page.getByTestId('cultivo-recomendacion-ec');
    this.cultivoRecomendacionAgua = page.getByTestId('cultivo-recomendacion-agua');
    this.cultivoRecomendacionEmpty = page.getByTestId('cultivo-recomendacion-empty');
    this.cultivoInfoCondiciones = page.getByTestId('cultivo-info-condiciones');
    this.cultivoCondicionesVegetacion = page.getByTestId('cultivo-condiciones-vegetacion');
    this.cultivoCondicionesFloracion = page.getByTestId('cultivo-condiciones-floracion');
    this.cultivoCondicionesEmpty = page.getByTestId('cultivo-condiciones-empty');
    this.cultivoNotas = page.getByTestId('cultivo-notas');
    this.cultivoNotasCuerpo = page.getByTestId('cultivo-notas-cuerpo');
    
    // Panel lateral
    this.cultivoPanelLateral = page.getByTestId('cultivo-panel-lateral');
    this.cultivoMetricasBox = page.getByTestId('cultivo-metricas-box');
    this.cultivoMetricasDiasInicio = page.getByTestId('cultivo-metricas-dias-inicio');
    this.cultivoMetricasPlantasM2 = page.getByTestId('cultivo-metricas-plantas-m2');
    this.cultivoMetricasWattsM2 = page.getByTestId('cultivo-metricas-watts-m2');
    this.cultivoMetricasLitrosTotales = page.getByTestId('cultivo-metricas-litros-totales');
    this.cultivoAccionesRapidasBox = page.getByTestId('cultivo-acciones-rapidas-box');
    this.cultivoAccionEditar = page.getByTestId('cultivo-accion-editar');
    this.cultivoAccionToggleEstado = page.getByTestId('cultivo-accion-toggle-estado');
    
    // Vistas de tabs individuales
    this.cultivoTabviewChat = page.getByTestId('cultivo-tabview-chat');
    this.cultivoTabviewComentarios = page.getByTestId('cultivo-tabview-comentarios');
    this.cultivoTabviewGaleria = page.getByTestId('cultivo-tabview-galeria');
    this.cultivoTabviewPlanificacion = page.getByTestId('cultivo-tabview-planificacion');
    
    // Modal de tarea individual
    this.cultivoModalTareaOverlay = page.getByTestId('cultivo-modal-tarea-overlay');
    this.cultivoModalTarea = page.getByTestId('cultivo-modal-tarea');
    this.cultivoModalTareaTitle = page.getByTestId('cultivo-modal-tarea-title');
    this.cultivoModalTareaDesc = page.getByTestId('cultivo-modal-tarea-desc');
    this.cultivoModalTareaCerrarX = page.getByTestId('cultivo-modal-tarea-cerrar-x');
    this.cultivoModalTareaBody = page.getByTestId('cultivo-modal-tarea-body');
    this.cultivoModalTareaTitulo = page.getByTestId('cultivo-modal-tarea-titulo');
    this.cultivoModalTareaTipo = page.getByTestId('cultivo-modal-tarea-tipo');
    this.cultivoModalTareaPrioridad = page.getByTestId('cultivo-modal-tarea-prioridad');
    this.cultivoModalTareaEstado = page.getByTestId('cultivo-modal-tarea-estado');
    this.cultivoModalTareaDescripcion = page.getByTestId('cultivo-modal-tarea-descripcion');
    this.cultivoModalTareaInfo = page.getByTestId('cultivo-modal-tarea-info');
    this.cultivoModalTareaFecha = page.getByTestId('cultivo-modal-tarea-fecha');
    this.cultivoModalTareaHora = page.getByTestId('cultivo-modal-tarea-hora');
    this.cultivoModalTareaDuracion = page.getByTestId('cultivo-modal-tarea-duracion');
    this.cultivoModalTareaRecurrente = page.getByTestId('cultivo-modal-tarea-recurrente');
    this.cultivoModalTareaRecordatorio = page.getByTestId('cultivo-modal-tarea-recordatorio');
    this.cultivoModalTareaEditar = page.getByTestId('cultivo-modal-tarea-editar');
    this.cultivoModalTareaCerrar = page.getByTestId('cultivo-modal-tarea-cerrar');
  }

  // ========================================
  // FUNCIONES DE NAVEGACIÓN Y ESTADO
  // ========================================

  /**
   * Navegar a la página de cultivos
   */
  async gotoCultivosPage(): Promise<void> {
    await this.page.goto(`${BASE_URL}/cultivo`);
    // Esperar a que la página se cargue completamente
    await this.page.waitForLoadState('networkidle');
    // Esperar a que el elemento principal esté visible
 
  }

  /**
   * Verificar que la página de cultivos esté visible
   */
  async cultivoPageIsVisible(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    
    // Verificar URL con más flexibilidad
    const currentUrl = this.page.url();
    console.log('🔍 URL actual en cultivoPageIsVisible:', currentUrl);
    
    // Si estamos en login con parámetro next, esperar un poco más
    if (currentUrl.includes('/login?next=')) {
      console.log('⚠️ Detectada redirección a login, esperando autenticación...');
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState('networkidle');
    }
    
    // Verificar que estamos en cultivos (con o sin parámetros)
    await expect(this.page).toHaveURL(/\/cultivo/);
    await this.page.waitForLoadState('networkidle');
    await expect(this.cultivoMainWrapper).toBeVisible({ timeout: 25000 });
  }

  /**
   * Esperar a que la página de cultivos esté completamente cargada
   */
  async waitForCultivosPageLoad(): Promise<void> {
    // Esperar a que la URL contenga 'cultivo'
    await this.page.waitForURL(/cultivo/, { timeout: 15000 });
    // Esperar a que no haya requests de red pendientes
    await this.page.waitForLoadState('networkidle');
    // Esperar a que el elemento principal esté visible
    await expect(this.cultivoMainWrapper).toBeVisible({ timeout: 15000 });
    // Esperar a que el hero esté visible
    await expect(this.cultivoHero).toBeVisible({ timeout: 10000 });
    // Esperar un poco más para asegurar que todo esté renderizado
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verificar que el wrapper principal esté visible
   */
  async mainWrapperIsVisible(): Promise<void> {
    await expect(this.cultivoMainWrapper).toBeVisible();
  }

  /**
   * Navegar a una página individual de cultivo
   */
  async gotoIndividualCultivo(cultivoId: string): Promise<void> {
    await this.page.goto(`https://bruceapp.onrender.com/cultivo/${cultivoId}`);
    // Esperar a que la página se cargue completamente
    await this.page.waitForLoadState('networkidle');
    // Esperar a que el elemento principal esté visible
    await this.page.waitForSelector('[data-testid="cultivo-main"]', { timeout: 20000 });
  }

  /**
   * Verificar que la página individual esté visible
   */
  async individualCultivoPageIsVisible(cultivoId: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`cultivo/${cultivoId}`));
    await expect(this.cultivoMain).toBeVisible({ timeout: 25000 });
  }

  /**
   * Esperar a que la página individual esté completamente cargada
   */
  async waitForIndividualCultivoPageLoad(cultivoId: string): Promise<void> {
    // Esperar a que la URL contenga el ID del cultivo
    await this.page.waitForURL(new RegExp(`cultivo/${cultivoId}`), { timeout: 15000 });
    // Esperar a que no haya requests de red pendientes
    await this.page.waitForLoadState('networkidle');
    // Esperar a que el elemento principal esté visible
    await expect(this.cultivoMain).toBeVisible({ timeout: 15000 });
    // Esperar a que el header esté visible
    await expect(this.cultivoHeader).toBeVisible({ timeout: 10000 });
    // Esperar un poco más para asegurar que todo esté renderizado
    await this.page.waitForTimeout(1000);
  }

  // ========================================
  // FUNCIONES DE HERO SECTION
  // ========================================

  /**
   * Verificar que el hero esté visible
   */
  async heroIsVisible(): Promise<void> {
    await expect(this.cultivoHero).toBeVisible();
    await expect(this.cultivoPageTitle).toBeVisible();
  }

  /**
   * Obtener el título de la página
   */
  async getPageTitle(): Promise<string> {
    return await this.cultivoPageTitle.textContent() || '';
  }

  /**
   * Obtener la descripción del hero
   */
  async getHeroDescription(): Promise<string> {
    return await this.cultivoHeroDesc.textContent() || '';
  }

  /**
   * Verificar que las estadísticas estén visibles
   */
  async statsAreVisible(): Promise<void> {
    await expect(this.cultivoHeroStats).toBeVisible();
    await expect(this.cultivoHeroStatTotal).toBeVisible();
    await expect(this.cultivoHeroStatActivos).toBeVisible();
    await expect(this.cultivoHeroStatM2).toBeVisible();
    await expect(this.cultivoHeroStatPlantas).toBeVisible();
  }

  /**
   * Obtener el número total de cultivos
   */
  async getTotalCultivos(): Promise<string> {
    return await this.cultivoHeroStatTotalN.textContent() || '0';
  }

  /**
   * Obtener el número de cultivos activos
   */
  async getActiveCultivos(): Promise<string> {
    return await this.cultivoHeroStatActivosN.textContent() || '0';
  }

  /**
   * Obtener el área total en m²
   */
  async getTotalM2(): Promise<string> {
    return await this.cultivoHeroStatM2N.textContent() || '0';
  }

  /**
   * Obtener el número total de plantas
   */
  async getTotalPlantas(): Promise<string> {
    return await this.cultivoHeroStatPlantasN.textContent() || '0';
  }

  // ========================================
  // FUNCIONES DE TABS NAVIGATION
  // ========================================

  /**
   * Verificar que los tabs estén visibles
   */
  async tabsAreVisible(): Promise<void> {
    await expect(this.cultivoTabsContainer).toBeVisible();
    await expect(this.cultivoTabCultivos).toBeVisible();
    await expect(this.cultivoTabPlanificacion).toBeVisible();
  }

  /**
   * Hacer clic en el tab de Cultivos
   */
  async clickCultivosTab(): Promise<void> {
    await this.cultivoTabCultivos.click();
  }

  /**
   * Hacer clic en el tab de Planificación
   */
  async clickPlanificacionTab(): Promise<void> {
    await this.cultivoTabPlanificacion.click();
  }

  /**
   * Verificar que el tab de Cultivos esté activo
   */
  async cultivosTabIsActive(): Promise<void> {
    await expect(this.cultivoTabCultivos).toHaveClass(/active/);
  }

  /**
   * Verificar que el tab de Planificación esté activo
   */
  async planificacionTabIsActive(): Promise<void> {
    await expect(this.cultivoTabPlanificacion).toHaveClass(/active/);
  }

  // ========================================
  // FUNCIONES DE TOOLBAR Y BÚSQUEDA
  // ========================================

  /**
   * Verificar que el toolbar esté visible
   */
  async toolbarIsVisible(): Promise<void> {
    await expect(this.cultivoToolbar).toBeVisible();
    await expect(this.cultivoSearchForm).toBeVisible();
    await expect(this.cultivoListControls).toBeVisible();
  }

  /**
   * Realizar búsqueda de cultivos
   */
  async searchCultivos(searchTerm: string): Promise<void> {
    await this.cultivoSearchInput.fill(searchTerm);
    await this.cultivoSearchButton.click();
  }

  /**
   * Limpiar búsqueda
   */
  async clearSearch(): Promise<void> {
    await this.cultivoSearchInput.clear();
  }

  /**
   * Obtener el valor del campo de búsqueda
   */
  async getSearchValue(): Promise<string> {
    return await this.cultivoSearchInput.inputValue();
  }

  /**
   * Filtrar por todos los cultivos
   */
  async filterTodos(): Promise<void> {
    await this.cultivoFiltroSelect.click();
    await this.cultivoFiltroSelectTodos.click();
  }

  /**
   * Filtrar por cultivos activos
   */
  async filterActivos(): Promise<void> {
    await this.cultivoFiltroSelect.click();
    await this.cultivoFiltroSelectActivos.click();
  }

  /**
   * Filtrar por cultivos inactivos
   */
  async filterInactivos(): Promise<void> {
    await this.cultivoFiltroSelect.click();
    await this.cultivoFiltroSelectInactivos.click();
  }

  /**
   * Alternar orden de la lista
   */
  async toggleOrder(): Promise<void> {
    await this.cultivoOrderToggle.click();
  }

  /**
   * Hacer clic en el botón de nuevo cultivo
   */
  async clickNewCultivo(): Promise<void> {
    await this.cultivoNewButton.click();
  }

  /**
   * Verificar que el botón nuevo esté habilitado
   */
  async newButtonIsEnabled(): Promise<void> {
    await expect(this.cultivoNewButton).toBeEnabled();
  }

  /**
   * Verificar que el botón nuevo esté deshabilitado
   */
  async newButtonIsDisabled(): Promise<void> {
    await expect(this.cultivoNewButton).toBeDisabled();
  }

  // ========================================
  // FUNCIONES DE FORMULARIOS
  // ========================================

  /**
   * Verificar que el formulario esté visible
   */
  async formIsVisible(): Promise<void> {
    await expect(this.cultivoFormWrapper).toBeVisible();
    await expect(this.cultivoForm).toBeVisible();
  }

  /**
   * Verificar que el formulario de creación esté visible
   */
  async createFormIsVisible(): Promise<void> {
    await expect(this.cultivoFormIconCrear).toBeVisible();
    await expect(this.cultivoFormTitle).toContainText('Crear');
  }

  /**
   * Verificar que el formulario de edición esté visible
   */
  async editFormIsVisible(): Promise<void> {
    await expect(this.cultivoFormIconEditar).toBeVisible();
    await expect(this.cultivoFormTitle).toContainText('Editar');
  }

  /**
   * Obtener el título del formulario
   */
  async getFormTitle(): Promise<string> {
    return await this.cultivoFormTitle.textContent() || '';
  }

  /**
   * Obtener la descripción del formulario
   */
  async getFormDescription(): Promise<string> {
    return await this.cultivoFormDesc.textContent() || '';
  }

  // ========================================
  // FUNCIONES DE ESTADOS DE LISTA
  // ========================================

  /**
   * Verificar que la lista esté visible
   */
  async listIsVisible(): Promise<void> {
    await expect(this.cultivoList).toBeVisible();
  }

  /**
   * Verificar estado de carga
   */
  async loadingStateIsVisible(): Promise<void> {
    await expect(this.cultivoListLoading).toBeVisible();
    await expect(this.cultivoListLoadingSpinner).toBeVisible();
  }

  /**
   * Verificar estado de error
   */
  async errorStateIsVisible(): Promise<void> {
    await expect(this.cultivoListError).toBeVisible();
    await expect(this.cultivoListErrorIcon).toBeVisible();
    await expect(this.cultivoListErrorText).toBeVisible();
  }

  /**
   * Obtener mensaje de error
   */
  async getErrorMessage(): Promise<string> {
    return await this.cultivoListErrorText.textContent() || '';
  }

  /**
   * Verificar estado vacío
   */
  async emptyStateIsVisible(): Promise<void> {
    await expect(this.cultivoListEmpty).toBeVisible();
    await expect(this.cultivoListEmptyIcon).toBeVisible();
    await expect(this.cultivoListEmptyLabel).toBeVisible();
  }

  /**
   * Obtener mensaje de estado vacío
   */
  async getEmptyMessage(): Promise<string> {
    return await this.cultivoListEmptyLabel.textContent() || '';
  }

  /**
   * Hacer clic en "Crear primer cultivo"
   */
  async clickCreateFirstCultivo(): Promise<void> {
    await this.cultivoListCreatefirstButton.click();
  }

  /**
   * Verificar que las cards estén visibles
   */
  async cardsListIsVisible(): Promise<void> {
    await expect(this.cultivoCardsList).toBeVisible();
  }

  /**
   * Obtener número de cards visibles
   */
  async getCardsCount(): Promise<number> {
    return await this.cultivoCard.count();
  }

  // ========================================
  // FUNCIONES DE CARDS DE CULTIVOS
  // ========================================

  /**
   * Obtener card por índice
   */
  async getCardByIndex(index: number): Promise<Locator> {
    return this.cultivoCard.nth(index);
  }

  /**
   * Obtener nombre de cultivo por índice
   */
  async getCultivoNameByIndex(index: number): Promise<string> {
    const card = await this.getCardByIndex(index);
    return await card.locator('[data-testid^="cultivo-card-nombre-"]').textContent() || '';
  }

  /**
   * Obtener estado de cultivo por índice
   */
  async getCultivoEstadoByIndex(index: number): Promise<string> {
    const card = await this.getCardByIndex(index);
    return await card.locator('[data-testid^="cultivo-card-estado-"]').textContent() || '';
  }

  /**
   * Obtener genética de cultivo por índice
   */
  async getCultivoGeneticaByIndex(index: number): Promise<string> {
    const card = await this.getCardByIndex(index);
    return await card.locator('[data-testid^="cultivo-card-genetica-"]').textContent() || '';
  }

  /**
   * Hacer clic en "Ver detalles" de un cultivo
   */
  async clickVerDetallesByIndex(index: number): Promise<void> {
    const card = await this.getCardByIndex(index);
    await card.locator('[data-testid^="cultivo-card-verdetalles-"]').click();
  }

  /**
   * Hacer clic en "Editar" de un cultivo
   */
  async clickEditarByIndex(index: number): Promise<void> {
    const card = await this.getCardByIndex(index);
    await card.locator('[data-testid^="cultivo-card-editar-"]').click();
  }

  /**
   * Hacer clic en "Eliminar" de un cultivo
   */
  async clickEliminarByIndex(index: number): Promise<void> {
    const card = await this.getCardByIndex(index);
    await card.locator('[data-testid^="cultivo-card-eliminar-"]').click();
  }

  /**
   * Verificar que una card esté visible
   */
  async cardIsVisibleByIndex(index: number): Promise<void> {
    const card = await this.getCardByIndex(index);
    await expect(card).toBeVisible();
  }

  // ========================================
  // FUNCIONES DE PÁGINA INDIVIDUAL
  // ========================================

  /**
   * Verificar estado de carga individual
   */
  async individualLoadingIsVisible(): Promise<void> {
    await expect(this.cultivoMainLoading).toBeVisible();
    await expect(this.cultivoLoadingBox).toBeVisible();
    await expect(this.cultivoLoadingSpinner).toBeVisible();
  }

  /**
   * Verificar estado de error individual
   */
  async individualErrorIsVisible(): Promise<void> {
    await expect(this.cultivoMainError).toBeVisible();
    await expect(this.cultivoErrorBox).toBeVisible();
    await expect(this.cultivoErrorIcon).toBeVisible();
  }

  /**
   * Obtener título de error individual
   */
  async getIndividualErrorTitle(): Promise<string> {
    return await this.cultivoErrorTitle.textContent() || '';
  }

  /**
   * Hacer clic en "Volver" desde error
   */
  async clickVolverFromError(): Promise<void> {
    await this.cultivoErrorVolver.click();
  }

  /**
   * Verificar que el header individual esté visible
   */
  async individualHeaderIsVisible(): Promise<void> {
    await expect(this.cultivoHeader).toBeVisible();
    await expect(this.cultivoNombre).toBeVisible();
    await expect(this.cultivoEstadoChip).toBeVisible();
  }

  /**
   * Obtener nombre del cultivo individual
   */
  async getIndividualCultivoName(): Promise<string> {
    return await this.cultivoNombre.textContent() || '';
  }

  /**
   * Obtener estado del cultivo individual
   */
  async getIndividualCultivoEstado(): Promise<string> {
    return await this.cultivoEstadoChip.textContent() || '';
  }

  /**
   * Hacer clic en "Volver" desde header
   */
  async clickVolverFromHeader(): Promise<void> {
    await this.cultivoVolverLink.click();
  }

  /**
   * Hacer clic en "Editar" desde header
   */
  async clickEditarFromHeader(): Promise<void> {
    await this.cultivoEditarBoton.click();
  }

  /**
   * Hacer clic en "Toggle Estado" desde header
   */
  async clickToggleEstadoFromHeader(): Promise<void> {
    await this.cultivoToggleEstadoBoton.click();
  }

  /**
   * Hacer clic en "Eliminar" desde header
   */
  async clickEliminarFromHeader(): Promise<void> {
    await this.cultivoEliminarBoton.click();
  }

  // ========================================
  // FUNCIONES DE TABS INDIVIDUALES
  // ========================================

  /**
   * Verificar que los tabs individuales estén visibles
   */
  async individualTabsAreVisible(): Promise<void> {
    await expect(this.cultivoTabsNav).toBeVisible();
    await expect(this.cultivoTabDetalles).toBeVisible();
    await expect(this.cultivoTabChat).toBeVisible();
    await expect(this.cultivoTabComentarios).toBeVisible();
    await expect(this.cultivoTabGaleria).toBeVisible();
    await expect(this.cultivoTabPlanificacionIndividual).toBeVisible();
  }

  /**
   * Hacer clic en tab de Detalles
   */
  async clickDetallesTab(): Promise<void> {
    await this.cultivoTabDetalles.click();
  }

  /**
   * Hacer clic en tab de Chat
   */
  async clickChatTab(): Promise<void> {
    await this.cultivoTabChat.click();
  }

  /**
   * Hacer clic en tab de Comentarios
   */
  async clickComentariosTab(): Promise<void> {
    await this.cultivoTabComentarios.click();
  }

  /**
   * Hacer clic en tab de Galería
   */
  async clickGaleriaTab(): Promise<void> {
    await this.cultivoTabGaleria.click();
  }

  /**
   * Hacer clic en tab de Planificación individual
   */
  async clickPlanificacionIndividualTab(): Promise<void> {
    await this.cultivoTabPlanificacionIndividual.click();
  }

  /**
   * Verificar que el tab de Detalles esté activo
   */
  async detallesTabIsActive(): Promise<void> {
    await expect(this.cultivoTabDetalles).toHaveClass(/active/);
  }

  /**
   * Verificar que el tab de Chat esté activo
   */
  async chatTabIsActive(): Promise<void> {
    await expect(this.cultivoTabChat).toHaveClass(/active/);
  }

  // ========================================
  // FUNCIONES DE FORMULARIO DE EDICIÓN
  // ========================================

  /**
   * Verificar que el formulario de edición esté visible
   */
  async editFormBoxIsVisible(): Promise<void> {
    await expect(this.cultivoFormEdicionBox).toBeVisible();
    await expect(this.cultivoFormEdicion).toBeVisible();
  }

  /**
   * Obtener título del formulario de edición
   */
  async getEditFormTitle(): Promise<string> {
    return await this.cultivoFormEdicionTitle.textContent() || '';
  }

  /**
   * Obtener nota del formulario de edición
   */
  async getEditFormNote(): Promise<string> {
    return await this.cultivoFormEdicionNote.textContent() || '';
  }

  // ========================================
  // FUNCIONES DE DETALLES Y INFORMACIÓN
  // ========================================

  /**
   * Verificar que el grid de detalles esté visible
   */
  async detallesGridIsVisible(): Promise<void> {
    await expect(this.cultivoDetallesGrid).toBeVisible();
  }

  /**
   * Verificar que la información básica esté visible
   */
  async infoBasicaIsVisible(): Promise<void> {
    await expect(this.cultivoInfoBasica).toBeVisible();
  }

  /**
   * Verificar que la información de sustrato esté visible
   */
  async infoSustratoIsVisible(): Promise<void> {
    await expect(this.cultivoInfoSustrato).toBeVisible();
  }

  /**
   * Verificar que la información de genética esté visible
   */
  async infoGeneticaIsVisible(): Promise<void> {
    await expect(this.cultivoInfoGenetica).toBeVisible();
  }

  /**
   * Verificar que la información técnica esté visible
   */
  async infoTecnicaIsVisible(): Promise<void> {
    await expect(this.cultivoInfoTecnica).toBeVisible();
  }

  /**
   * Verificar que el estado principal esté visible
   */
  async estadoMainIsVisible(): Promise<void> {
    await expect(this.cultivoEstadoMain).toBeVisible();
  }

  /**
   * Obtener fase actual del cultivo
   */
  async getFaseActual(): Promise<string> {
    return await this.cultivoEstadoFaseactual.textContent() || '';
  }

  /**
   * Obtener días de vegetación
   */
  async getDiasVegetacion(): Promise<string> {
    return await this.cultivoEstadoDiasVegetacion.textContent() || '';
  }

  /**
   * Obtener días de floración
   */
  async getDiasFloracion(): Promise<string> {
    return await this.cultivoEstadoDiasFloracion.textContent() || '';
  }

  /**
   * Verificar que el botón de iniciar floración esté visible
   */
  async iniciarFloracionBoxIsVisible(): Promise<void> {
    await expect(this.cultivoIniciarFloracionBox).toBeVisible();
  }

  /**
   * Hacer clic en "Iniciar Floración"
   */
  async clickIniciarFloracion(): Promise<void> {
    await this.cultivoIniciarFloracionBoton.click();
  }

  /**
   * Verificar que las recomendaciones estén visibles
   */
  async recomendacionesIsVisible(): Promise<void> {
    await expect(this.cultivoInfoRecomendaciones).toBeVisible();
  }

  /**
   * Verificar que las condiciones estén visibles
   */
  async condicionesIsVisible(): Promise<void> {
    await expect(this.cultivoInfoCondiciones).toBeVisible();
  }

  /**
   * Verificar que las notas estén visibles
   */
  async notasIsVisible(): Promise<void> {
    await expect(this.cultivoNotas).toBeVisible();
  }

  // ========================================
  // FUNCIONES DE PANEL LATERAL
  // ========================================

  /**
   * Verificar que el panel lateral esté visible
   */
  async panelLateralIsVisible(): Promise<void> {
    await expect(this.cultivoPanelLateral).toBeVisible();
  }

  /**
   * Verificar que las métricas estén visibles
   */
  async metricasBoxIsVisible(): Promise<void> {
    await expect(this.cultivoMetricasBox).toBeVisible();
  }

  /**
   * Obtener días desde inicio
   */
  async getDiasInicio(): Promise<string> {
    return await this.cultivoMetricasDiasInicio.textContent() || '';
  }

  /**
   * Obtener plantas por m²
   */
  async getPlantasM2(): Promise<string> {
    return await this.cultivoMetricasPlantasM2.textContent() || '';
  }

  /**
   * Obtener watts por m²
   */
  async getWattsM2(): Promise<string> {
    return await this.cultivoMetricasWattsM2.textContent() || '';
  }

  /**
   * Obtener litros totales
   */
  async getLitrosTotales(): Promise<string> {
    return await this.cultivoMetricasLitrosTotales.textContent() || '';
  }

  /**
   * Verificar que las acciones rápidas estén visibles
   */
  async accionesRapidasBoxIsVisible(): Promise<void> {
    await expect(this.cultivoAccionesRapidasBox).toBeVisible();
  }

  /**
   * Hacer clic en acción de editar
   */
  async clickAccionEditar(): Promise<void> {
    await this.cultivoAccionEditar.click();
  }

  /**
   * Hacer clic en acción de toggle estado
   */
  async clickAccionToggleEstado(): Promise<void> {
    await this.cultivoAccionToggleEstado.click();
  }

  // ========================================
  // FUNCIONES DE VISTAS DE TABS
  // ========================================

  /**
   * Verificar que la vista de chat esté visible
   */
  async chatViewIsVisible(): Promise<void> {
    await expect(this.cultivoTabviewChat).toBeVisible();
  }

  /**
   * Verificar que la vista de comentarios esté visible
   */
  async comentariosViewIsVisible(): Promise<void> {
    await expect(this.cultivoTabviewComentarios).toBeVisible();
  }

  /**
   * Verificar que la vista de galería esté visible
   */
  async galeriaViewIsVisible(): Promise<void> {
    await expect(this.cultivoTabviewGaleria).toBeVisible();
  }

  /**
   * Verificar que la vista de planificación esté visible
   */
  async planificacionViewIsVisible(): Promise<void> {
    await expect(this.cultivoTabviewPlanificacion).toBeVisible();
  }

  // ========================================
  // FUNCIONES DE MODALES DE TAREAS
  // ========================================

  /**
   * Verificar que el modal de tarea esté visible
   */
  async tareaModalIsVisible(): Promise<void> {
    await expect(this.cultivoTareaModalBackdrop).toBeVisible();
    await expect(this.cultivoTareaModal).toBeVisible();
    await expect(this.cultivoTareaModalContent).toBeVisible();
  }

  /**
   * Obtener título del modal de tarea
   */
  async getTareaModalTitle(): Promise<string> {
    return await this.cultivoTareaModalTitle.textContent() || '';
  }

  /**
   * Obtener subtítulo del modal de tarea
   */
  async getTareaModalSubtitle(): Promise<string> {
    return await this.cultivoTareaModalSubtitle.textContent() || '';
  }

  /**
   * Cerrar modal de tarea
   */
  async closeTareaModal(): Promise<void> {
    await this.cultivoTareaModalClose.click();
  }

  /**
   * Verificar que el modal individual de tarea esté visible
   */
  async individualTareaModalIsVisible(): Promise<void> {
    await expect(this.cultivoModalTareaOverlay).toBeVisible();
    await expect(this.cultivoModalTarea).toBeVisible();
  }

  /**
   * Obtener título del modal individual de tarea
   */
  async getIndividualTareaModalTitle(): Promise<string> {
    return await this.cultivoModalTareaTitle.textContent() || '';
  }

  /**
   * Cerrar modal individual de tarea
   */
  async closeIndividualTareaModal(): Promise<void> {
    await this.cultivoModalTareaCerrarX.click();
  }

  /**
   * Hacer clic en editar tarea en modal
   */
  async clickEditarTareaInModal(): Promise<void> {
    await this.cultivoModalTareaEditar.click();
  }

  // ========================================
  // FUNCIONES DE PLANIFICACIÓN
  // ========================================

  /**
   * Verificar que el wrapper de planificación esté visible
   */
  async planificacionWrapperIsVisible(): Promise<void> {
    await expect(this.cultivoPlanificacionWrapper).toBeVisible();
  }

  /**
   * Verificar que el calendario esté visible
   */
  async calendarioIsVisible(): Promise<void> {
    await expect(this.cultivoCalendario).toBeVisible();
  }

  /**
   * Verificar que la gestión de tareas esté visible
   */
  async gestionTareasIsVisible(): Promise<void> {
    await expect(this.cultivoGestionTareas).toBeVisible();
  }

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  /**
   * Esperar a que la página esté completamente cargada
   */
  async waitForPageLoad(): Promise<void> {
    // Esperar a que no haya requests de red pendientes
    await this.page.waitForLoadState('networkidle');
    // Esperar a que el elemento principal esté visible
    await expect(this.cultivoMainWrapper).toBeVisible({ timeout: 15000 });
  }

  /**
   * Esperar a que el formulario esté visible
   */
  async waitForFormLoad(): Promise<void> {
    // Esperar a que el wrapper del formulario esté visible
    await expect(this.cultivoFormWrapper).toBeVisible({ timeout: 10000 });
    // Esperar a que el formulario esté visible
    await expect(this.cultivoForm).toBeVisible({ timeout: 10000 });
    // Esperar un poco más para asegurar que los campos estén renderizados
    await this.page.waitForTimeout(500);
  }

  /**
   * Esperar a que el modal esté visible
   */
  async waitForModalLoad(): Promise<void> {
    // Esperar a que el modal esté visible
    await expect(this.cultivoTareaModal).toBeVisible({ timeout: 10000 });
    // Esperar un poco más para asegurar que el contenido esté renderizado
    await this.page.waitForTimeout(500);
  }

  /**
   * Verificar que no hay errores en la página
   */
  async noErrorsAreVisible(): Promise<void> {
    await expect(this.cultivoListError).not.toBeVisible();
    await expect(this.cultivoMainError).not.toBeVisible();
  }

  /**
   * Obtener URL actual
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Hacer scroll hasta un elemento
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Hacer scroll hasta el top de la página
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Hacer scroll hasta el bottom de la página
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Tomar screenshot de la página
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Verificar que un elemento esté visible y contenga texto
   */
  async elementIsVisibleWithText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toBeVisible();
    await expect(locator).toContainText(text);
  }

  /**
   * Verificar que un elemento esté habilitado
   */
  async elementIsEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  /**
   * Verificar que un elemento esté deshabilitado
   */
  async elementIsDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  /**
   * Obtener texto de un elemento
   */
  async getElementText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Obtener valor de un input
   */
  async getInputValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  /**
   * Llenar un input
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Limpiar un input
   */
  async clearInput(locator: Locator): Promise<void> {
    await locator.clear();
  }

  /**
   * Hacer clic en un elemento
   */
  async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Hacer doble clic en un elemento
   */
  async doubleClickElement(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Hacer hover sobre un elemento
   */
  async hoverElement(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Verificar que un elemento tenga una clase específica
   */
  async elementHasClass(locator: Locator, className: string): Promise<void> {
    await expect(locator).toHaveClass(className);
  }

  /**
   * Verificar que un elemento contenga texto
   */
  async elementContainsText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  /**
   * Verificar que un elemento tenga un atributo específico
   */
  async elementHasAttribute(locator: Locator, attribute: string, value: string): Promise<void> {
    await expect(locator).toHaveAttribute(attribute, value);
  }

  /**
   * Esperar a que un elemento esté visible
   */
  async waitForElementVisible(locator: Locator, timeout: number = 5000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Esperar a que un elemento no esté visible
   */
  async waitForElementHidden(locator: Locator, timeout: number = 5000): Promise<void> {
    await expect(locator).not.toBeVisible({ timeout });
  }

  /**
   * Esperar a que un elemento esté habilitado
   */
  async waitForElementEnabled(locator: Locator, timeout: number = 5000): Promise<void> {
    await expect(locator).toBeEnabled({ timeout });
  }

  /**
   * Esperar a que un elemento esté deshabilitado
   */
  async waitForElementDisabled(locator: Locator, timeout: number = 5000): Promise<void> {
    await expect(locator).toBeDisabled({ timeout });
  }

}
