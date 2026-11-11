// Ponto de entrada. As tasks de segundo plano (ações das notificações) precisam ser definidas aqui, no
// escopo global, e não numa rota: quando o Android acorda o app só para tratar uma ação, nenhuma tela é
// renderizada e o Expo Router não carrega `_layout`. Sem isso o JS falha com
// "No task registered for key expo-task-manager" e a ação se perde.
import "./src/lib/notifications/background";
import "expo-router/entry";
