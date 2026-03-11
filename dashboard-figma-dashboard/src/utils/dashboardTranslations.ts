export type LanguageType = 'en' | 'es' | 'ru';

export const dashboardTranslations = {
  en: {
    // Header
    moodMeterDashboard: 'MoodMeter Dashboard',
    realTimeAnalytics: 'Real-time analytics and insights from mood tracking data',
    
    // Navigation & Controls
    adminLogin: 'Admin Login',
    adminActive: 'Admin Active',
    logout: 'Logout',
    settings: 'Settings',
    csvData: 'CSV Data',
    importCSV: 'Import CSV Data',
    csvImportManager: 'CSV Data Import Manager',
    uploadCSVFiles: 'Upload CSV Files',
    csvFormatGuidelines: 'CSV Format Guidelines',
    importedFiles: 'Imported Files',
    sampleDataPreview: 'Sample Data Preview',
    dropCSVFiles: 'Drop CSV files here',
    browseFiles: 'Browse Files',
    downloadTemplate: 'Download Template',
    processingFiles: 'Processing...',
    nightVision: 'Night Vision',
    language: 'Language',
    location: 'Location',
    allLocations: 'All Locations',
    
    // Time Periods
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    
    // Buttons & Actions
    export: 'Export',
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',
    search: 'Search',
    dateRange: 'Date Range',
    quickStats: 'Quick Stats',
    clearFilters: 'Clear Filters',
    
    // Date Search
    searchSpecificDate: 'Search Specific Date',
    pickADate: 'Pick a date',
    clear: 'Clear',
    selectDateRange: 'Select Date Range',
    from: 'From',
    to: 'To',
    
    // Charts & Analytics
    moodDistribution: 'Mood Distribution',
    moodTrends: 'Mood Trends',
    emotionBreakdown: 'Emotion Breakdown',
    reactionTimeAnalytics: 'Reaction Time Analytics',
    timeSpentChoosingEmotion: 'Time spent choosing emotion after title screen',
    responseCount: 'Response Count',
    locationStats: 'Location Statistics',
    
    // Stats Cards
    totalEntries: 'Total Entries',
    totalResponses: 'Total Responses',
    pleasantMoods: 'Pleasant Moods',
    highEnergy: 'High Energy',
    averageIntensity: 'Average Intensity',
    avgIntensity: 'Avg Intensity',
    avgResponseTime: 'Avg Response Time',
    responseTime: 'Response Time',
    mostCommonEmotion: 'Most Common Emotion',
    
    // Theme Names
    dayTheme: 'Day',
    darkTheme: 'Dark',
    lightblueTheme: 'Light Blue',
    yellowTheme: 'Yellow',
    
    // Categories
    highEnergyPleasant: 'High Energy Pleasant',
    highEnergyUnpleasant: 'High Energy Unpleasant',
    lowEnergyPleasant: 'Low Energy Pleasant',
    lowEnergyUnpleasant: 'Low Energy Unpleasant',
    
    // Messages
    noDataMessage: 'No data available for the selected period',
    loadingMessage: 'Loading data...',
    
    // Chart Labels
    distributionStudents: 'Distribution of student theme toggle selections',
    topEmotions: 'Top Emotions',
    topL2Emotions: 'Top L2 Emotions',
    emotionCounts: 'Emotion Counts',
    averageResponseTime: 'Average Response Time',
    responses: 'responses',
    avgResponse: 'Avg response',
    moodDistributionAnalytics: 'Mood Distribution Analytics',
    moodTrendsOverTime: 'Mood Trends Over Time',
    l1CategoryComparison: 'L1 Category Comparison',
    selectUpToTwoCategories: 'Select up to 2 categories to compare',
    expandedView: 'Expanded View',
    detailedMoodCategoryView: 'Detailed view of mood category distribution across different time periods',
    
    // Y-axis labels
    numberOfEntries: 'Number of Entries',
    checkInCount: 'Check-in Count',
    hourOfDay: 'Hour of Day',
    
    dataCorrelationAnalysis: 'Data Correlation Analysis',
    categoryVsResponseTime: 'Category vs Response Time',
    categoryDistributionByHour: 'Category Distribution by Hour',
    intensityVsResponseTime: 'Intensity vs Response Time',
    checkinsByLocation: 'Check-ins by Location',
    distributionMoodEntries: 'Distribution of mood entries across kiosk locations',
    checkins: 'check-ins',
    addLocation: 'Add Location',
    pleaseEnterLocationName: 'Please enter a location name',
    addedLocation: 'Added location',
    mostCommonL1: 'Most Common L1',
    topL2Emotion: 'Top L2 Emotion',
    dataPoints: 'Data Points',
    entriesAnalyzed: 'entries analyzed',
    notAvailable: 'N/A',
    
    // Theme preferences
    unknownTheme: 'Unknown',
    themeLabel: 'Theme',
    
    // Time Labels
    seconds: 'seconds',
    milliseconds: 'ms',
    entries: 'entries',
    selections: 'selections',
    
    // Data Correlation
    compareDataSources: 'Compare mood meter data with external data sources to identify correlations and patterns',
    dataSourceType: 'Data Source Type',
    selectSourceType: 'Select source type',
    none: 'None',
    apiDataSource: 'API Data Source',
    csvDataSource: 'CSV Data Source',
    noneEnabled: 'None enabled',
    noneUploaded: 'None uploaded',
    selectAPI: 'Select API',
    chooseAPI: 'Choose an API',
    selectCSV: 'Select CSV',
    chooseCSV: 'Choose a CSV file',
    showEmotionTrends: 'Show Emotion Trends',
    l1EmotionsPrimary: 'L1 Emotions (Primary: Happy, Sad, Angry, Fearful)',
    l2EmotionsSpecific: 'L2 Emotions (Specific: Excited, Anxious, etc.)',
    selectParametersToCompare: 'Select Parameters to Compare',
    selected: 'selected',
    selectDataSourceMessage: 'Select a data source type and parameter to compare with mood data. Enable data sources in Admin Settings.',
    noDataSourcesAvailable: 'No data sources available. Upload CSV files or configure API endpoints in Admin Settings to enable correlation analysis.',
    correlationCoefficients: 'Correlation Coefficients',
    vsL1: 'vs L1',
    vsL2: 'vs L2',
    strong: 'Strong',
    moderate: 'Moderate',
    weak: 'Weak',
    emotionIntensity: 'Emotion Intensity',
    parameterValues: 'Parameter Values',
    l1EmotionsPrimaryChart: 'L1 Emotions (Primary)',
    l2EmotionsSpecificChart: 'L2 Emotions (Specific)',
    chartShowsCorrelations: 'This chart shows correlations between',
    emotionTrends: 'emotion trends',
    l1AndL2EmotionTrends: 'L1 and L2 emotion trends',
    l1EmotionTrends: 'L1 emotion trends',
    l2EmotionTrends: 'L2 emotion trends',
    selectedParameters: 'selected parameters',
    correlationCoefficientsExplanation: 'Correlation coefficients closer to 1 or -1 indicate stronger relationships.'
  },
  
  es: {
    // Header
    moodMeterDashboard: 'Panel de Control del Medidor de Ánimo',
    realTimeAnalytics: 'Análisis e información en tiempo real de los datos de seguimiento del estado de ánimo',
    
    // Navigation & Controls
    adminLogin: 'Iniciar Sesión de Administrador',
    adminActive: 'Admin Activo',
    logout: 'Cerrar Sesión',
    csvData: 'Datos CSV',
    importCSV: 'Importar Datos CSV',
    csvImportManager: 'Gestor de Importación CSV',
    uploadCSVFiles: 'Subir Archivos CSV',
    csvFormatGuidelines: 'Pautas de Formato CSV',
    importedFiles: 'Archivos Importados',
    sampleDataPreview: 'Vista Previa de Datos',
    dropCSVFiles: 'Soltar archivos CSV aquí',
    browseFiles: 'Buscar Archivos',
    downloadTemplate: 'Descargar Plantilla',
    processingFiles: 'Procesando...',
    settings: 'Configuración',
    nightVision: 'Visión Nocturna',
    language: 'Idioma',
    location: 'Ubicación',
    allLocations: 'Todas las Ubicaciones',
    
    // Time Periods
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
    
    // Buttons & Actions
    export: 'Exportar',
    exportCSV: 'Exportar CSV',
    exportPDF: 'Exportar PDF',
    search: 'Buscar',
    dateRange: 'Rango de Fechas',
    quickStats: 'Estadísticas Rápidas',
    clearFilters: 'Limpiar Filtros',
    
    // Charts & Analytics
    moodDistribution: 'Distribución del Estado de Ánimo',
    moodTrends: 'Tendencias del Estado de Ánimo',
    emotionBreakdown: 'Desglose de Emociones',
    reactionTimeAnalytics: 'Análisis de Tiempo de Reacción',
    timeSpentChoosingEmotion: 'Tiempo dedicado a elegir emoción después de la pantalla de título',
    responseCount: 'Conteo de Respuestas',
    locationStats: 'Estadísticas de Ubicación',
    
    // Stats Cards
    totalEntries: 'Entradas Totales',
    totalResponses: 'Respuestas Totales',
    pleasantMoods: 'Estados de Ánimo Agradables',
    highEnergy: 'Alta Energía',
    averageIntensity: 'Intensidad Promedio',
    avgIntensity: 'Intensidad Prom.',
    avgResponseTime: 'Tiempo de Respuesta Prom.',
    responseTime: 'Tiempo de Respuesta',
    mostCommonEmotion: 'Emoción Más Común',
    
    // Theme Names
    dayTheme: 'Día',
    darkTheme: 'Oscuro',
    lightblueTheme: 'Azul Claro',
    yellowTheme: 'Amarillo',
    
    // Categories
    highEnergyPleasant: 'Alta Energía Agradable',
    highEnergyUnpleasant: 'Alta Energía Desagradable',
    lowEnergyPleasant: 'Baja Energía Agradable',
    lowEnergyUnpleasant: 'Baja Energía Desagradable',
    
    // Messages
    noDataMessage: 'No hay datos disponibles para el período seleccionado',
    loadingMessage: 'Cargando datos...',
    
    // Chart Labels
    distributionStudents: 'Distribución de selecciones de tema por estudiantes',
    topEmotions: 'Principales Emociones',
    topL2Emotions: 'Principales Emociones L2',
    emotionCounts: 'Conteos de Emociones',
    averageResponseTime: 'Tiempo de Respuesta Promedio',
    responses: 'respuestas',
    avgResponse: 'Respuesta prom.',
    moodDistributionAnalytics: 'Análisis de Distribución del Estado de Ánimo',
    moodTrendsOverTime: 'Tendencias del Estado de Ánimo a lo Largo del Tiempo',
    l1CategoryComparison: 'Comparación de Categorías L1',
    selectUpToTwoCategories: 'Seleccione hasta 2 categorías para comparar',
    expandedView: 'Vista Ampliada',
    detailedMoodCategoryView: 'Vista detallada de la distribución de categorías de estado de ánimo en diferentes períodos de tiempo',
    
    // Y-axis labels
    numberOfEntries: 'Número de Entradas',
    checkInCount: 'Recuento de Registros',
    hourOfDay: 'Hora del Día',
    
    dataCorrelationAnalysis: 'Análisis de Correlación de Datos',
    categoryVsResponseTime: 'Categoría vs Tiempo de Respuesta',
    categoryDistributionByHour: 'Distribución de Categorías por Hora',
    intensityVsResponseTime: 'Intensidad vs Tiempo de Respuesta',
    searchSpecificDate: 'Buscar Fecha Específica',
    pickADate: 'Elegir una fecha',
    clear: 'Limpiar',
    selectDateRange: 'Seleccionar Rango de Fechas',
    from: 'Desde',
    to: 'Hasta',
    customDateRange: 'Rango de Fechas Personalizado',
    checkinsByLocation: 'Check-ins por Ubicación',
    distributionMoodEntries: 'Distribución de entradas de estado de ánimo en ubicaciones de quiosco',
    checkins: 'check-ins',
    addLocation: 'Agregar Ubicación',
    pleaseEnterLocationName: 'Por favor ingrese un nombre de ubicación',
    addedLocation: 'Ubicación agregada',
    mostCommonL1: 'L1 Más Común',
    topL2Emotion: 'Emoción L2 Principal',
    dataPoints: 'Puntos de Datos',
    entriesAnalyzed: 'entradas analizadas',
    notAvailable: 'N/A',
    
    // Theme preferences
    unknownTheme: 'Desconocido',
    themeLabel: 'Tema',
    
    // Time Labels
    seconds: 'segundos',
    milliseconds: 'ms',
    entries: 'entradas',
    selections: 'selecciones',
    
    // Data Correlation
    compareDataSources: 'Comparar datos del medidor de ánimo con fuentes de datos externas para identificar correlaciones y patrones',
    dataSourceType: 'Tipo de Fuente de Datos',
    selectSourceType: 'Seleccionar tipo de fuente',
    none: 'Ninguno',
    apiDataSource: 'Fuente de Datos API',
    csvDataSource: 'Fuente de Datos CSV',
    noneEnabled: 'Ninguno habilitado',
    noneUploaded: 'Ninguno cargado',
    selectAPI: 'Seleccionar API',
    chooseAPI: 'Elegir una API',
    selectCSV: 'Seleccionar CSV',
    chooseCSV: 'Elegir un archivo CSV',
    showEmotionTrends: 'Mostrar Tendencias de Emociones',
    l1EmotionsPrimary: 'Emociones L1 (Primarias: Feliz, Triste, Enojado, Temeroso)',
    l2EmotionsSpecific: 'Emociones L2 (Específicas: Emocionado, Ansioso, etc.)',
    selectParametersToCompare: 'Seleccionar Parámetros para Comparar',
    selected: 'seleccionados',
    selectDataSourceMessage: 'Seleccione un tipo de fuente de datos y un parámetro para comparar con los datos de ánimo. Habilite fuentes de datos en Configuración de Administrador.',
    noDataSourcesAvailable: 'No hay fuentes de datos disponibles. Cargue archivos CSV o configure puntos finales de API en Configuración de Administrador para habilitar el análisis de correlación.',
    correlationCoefficients: 'Coeficientes de Correlación',
    vsL1: 'vs L1',
    vsL2: 'vs L2',
    strong: 'Fuerte',
    moderate: 'Moderado',
    weak: 'Débil',
    emotionIntensity: 'Intensidad de Emoción',
    parameterValues: 'Valores de Parámetros',
    l1EmotionsPrimaryChart: 'Emociones L1 (Primarias)',
    l2EmotionsSpecificChart: 'Emociones L2 (Específicas)',
    chartShowsCorrelations: 'Este gráfico muestra correlaciones entre',
    emotionTrends: 'tendencias de emociones',
    l1AndL2EmotionTrends: 'tendencias de emociones L1 y L2',
    l1EmotionTrends: 'tendencias de emociones L1',
    l2EmotionTrends: 'tendencias de emociones L2',
    selectedParameters: 'parámetros seleccionados',
    correlationCoefficientsExplanation: 'Los coeficientes de correlación más cercanos a 1 o -1 indican relaciones más fuertes.'
  },
  
  ru: {
    // Header
    moodMeterDashboard: 'Панель Управления Измерителя Настроения',
    realTimeAnalytics: 'Аналитика и аналитические данные в реальном времени из данных отслеживания настроения',
    
    // Navigation & Controls
    adminLogin: 'Вход Администратора',
    adminActive: 'Админ Активен',
    logout: 'Выйти',
    csvData: 'Данные CSV',
    importCSV: 'Импорт Данных CSV',
    csvImportManager: 'Менеджер Импорта CSV',
    uploadCSVFiles: 'Загрузить CSV Файлы',
    csvFormatGuidelines: 'Рекомендации по Формату CSV',
    importedFiles: 'Импортированные Файлы',
    sampleDataPreview: 'Предварительный Просмотр',
    dropCSVFiles: 'Перетащите CSV файлы сюда',
    browseFiles: 'Обзор Файлов',
    downloadTemplate: 'Скачать Шаблон',
    processingFiles: 'Обработка...',
    settings: 'Настройки',
    nightVision: 'Ночное Видение',
    language: 'Язык',
    location: 'Местоположение',
    allLocations: 'Все Местоположения',
    
    // Time Periods
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
    
    // Buttons & Actions
    export: 'Экспорт',
    exportCSV: 'Экспорт CSV',
    exportPDF: 'Экспорт PDF',
    search: 'Поиск',
    dateRange: 'Диапазон Дат',
    quickStats: 'Быстрая Статистика',
    clearFilters: 'Очистить Фильтры',
    
    // Charts & Analytics
    moodDistribution: 'Распределение Настроения',
    moodTrends: 'Тенденции Настроения',
    emotionBreakdown: 'Разбор Эмоций',
    reactionTimeAnalytics: 'Аналитика Времени Реакции',
    timeSpentChoosingEmotion: 'Время, потраченное на выбор эмоции после заглавного экрана',
    responseCount: 'Количество Ответов',
    locationStats: 'Статистика Местоположения',
    
    // Stats Cards
    totalEntries: 'Всего Записей',
    totalResponses: 'Всего Ответов',
    pleasantMoods: 'Приятные Настроения',
    highEnergy: 'Высокая Энергия',
    averageIntensity: 'Средняя Интенсивность',
    avgIntensity: 'Ср. Интенсивность',
    avgResponseTime: 'Ср. Время Отклика',
    responseTime: 'Время Отклика',
    mostCommonEmotion: 'Самая Частая Эмоция',
    
    // Theme Names
    dayTheme: 'День',
    darkTheme: 'Тёмная',
    lightblueTheme: 'Голубая',
    yellowTheme: 'Жёлтая',
    
    // Categories
    highEnergyPleasant: 'Высокая Энергия Приятная',
    highEnergyUnpleasant: 'Высокая Энергия Неприятная',
    lowEnergyPleasant: 'Низкая Энергия Приятная',
    lowEnergyUnpleasant: 'Низкая Энергия Неприятная',
    
    // Messages
    noDataMessage: 'Нет данных для выбранного периода',
    loadingMessage: 'Загрузка данных...',
    
    // Chart Labels
    distributionStudents: 'Распределение выборов темы студентами',
    topEmotions: 'Топ Эмоций',
    topL2Emotions: 'Топ Эмоций L2',
    emotionCounts: 'Количество Эмоций',
    averageResponseTime: 'Среднее Время Отклика',
    responses: 'ответы',
    avgResponse: 'Ср. ответ',
    moodDistributionAnalytics: 'Аналитика Распределения Настроения',
    moodTrendsOverTime: 'Тенденции Настроения Во Времени',
    l1CategoryComparison: 'Сравнение Категорий L1',
    selectUpToTwoCategories: 'Выберите до 2 категорий для сравнения',
    expandedView: 'Расширенный Вид',
    detailedMoodCategoryView: 'Подробный вид распределения категорий настроения в разные периоды времени',
    
    // Y-axis labels
    numberOfEntries: 'Количество Записей',
    checkInCount: 'Количество Регистраций',
    hourOfDay: 'Час Дня',
    
    dataCorrelationAnalysis: 'Анализ Корреляции Данных',
    categoryVsResponseTime: 'Категория против Времени Отклика',
    categoryDistributionByHour: 'Распределение Категорий по Часам',
    intensityVsResponseTime: 'Интенсивность против Времени Отклика',
    searchSpecificDate: 'Поиск Конкретной Даты',
    pickADate: 'Выберите дату',
    clear: 'Очистить',
    selectDateRange: 'Выбрать Диапазон Дат',
    from: 'С',
    to: 'По',
    customDateRange: 'Пользовательский Диапазон Дат',
    checkinsByLocation: 'Регистрации по Местоположению',
    distributionMoodEntries: 'Распределение записей настроения по местоположениям киосков',
    checkins: 'регистрации',
    addLocation: 'Добавить Местоположение',
    pleaseEnterLocationName: 'Пожалуйста, введите название местоположения',
    addedLocation: 'Местоположение добавлено',
    mostCommonL1: 'Самая Частая L1',
    topL2Emotion: 'Топ Эмоция L2',
    dataPoints: 'Точки Данных',
    entriesAnalyzed: 'записей проанализировано',
    notAvailable: 'Н/Д',
    
    // Theme preferences
    unknownTheme: 'Неизвестно',
    themeLabel: 'Тема',
    
    // Time Labels
    seconds: 'секунд',
    milliseconds: 'мс',
    entries: 'записей',
    selections: 'выборов',
    
    // Data Correlation
    compareDataSources: 'Сравните данные измерителя настроения с внешними источниками данных для выявления корреляций и закономерностей',
    dataSourceType: 'Тип Источника Данных',
    selectSourceType: 'Выбрать тип источника',
    none: 'Нет',
    apiDataSource: 'Источник Данных API',
    csvDataSource: 'Источник Данных CSV',
    noneEnabled: 'Не включено',
    noneUploaded: 'Не загружено',
    selectAPI: 'Выбрать API',
    chooseAPI: 'Выберите API',
    selectCSV: 'Выбрать CSV',
    chooseCSV: 'Выберите файл CSV',
    showEmotionTrends: 'Показать Тенденции Эмоций',
    l1EmotionsPrimary: 'Эмоции L1 (Основные: Счастливый, Грустный, Злой, Испуганный)',
    l2EmotionsSpecific: 'Эмоции L2 (Специфические: Взволнованный, Тревожный и т.д.)',
    selectParametersToCompare: 'Выбрать Параметры для Сравнения',
    selected: 'выбрано',
    selectDataSourceMessage: 'Выберите тип источника данных и параметр для сравнения с данными настроения. Включите источники данных в Настройках Администратора.',
    noDataSourcesAvailable: 'Нет доступных источников данных. Загрузите CSV-файлы или настройте конечные точки API в Настройках Администратора для анализа корреляции.',
    correlationCoefficients: 'Коэффициенты Корреляции',
    vsL1: 'против L1',
    vsL2: 'против L2',
    strong: 'Сильная',
    moderate: 'Умеренная',
    weak: 'Слабая',
    emotionIntensity: 'Интенсивность Эмоций',
    parameterValues: 'Значения Параметров',
    l1EmotionsPrimaryChart: 'Эмоции L1 (Основные)',
    l2EmotionsSpecificChart: 'Эмоции L2 (Специфические)',
    chartShowsCorrelations: 'Этот график показывает корреляции между',
    emotionTrends: 'тенденциями эмоций',
    l1AndL2EmotionTrends: 'тенденциями эмоций L1 и L2',
    l1EmotionTrends: 'тенденциями эмоций L1',
    l2EmotionTrends: 'тенденциями эмоций L2',
    selectedParameters: 'выбранными параметрами',
    correlationCoefficientsExplanation: 'Коэффициенты корреляции ближе к 1 или -1 указывают на более сильные отношения.'
  }
};

export function useTranslation(language: LanguageType) {
  const lang = language && dashboardTranslations[language as keyof typeof dashboardTranslations]
    ? language
    : 'en';
  const dict = dashboardTranslations[lang];
  return (key: keyof typeof dashboardTranslations.en) => {
    return (dict && dict[key]) || dashboardTranslations.en[key] || String(key);
  };
}