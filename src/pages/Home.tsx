import AiIllustrationDialog from "@/components/AiIllustration/AiIllustrationDialog";
import PreviewCanvas from "@/components/Workbench/PreviewCanvas";
import ResourceModal from "@/components/Workbench/ResourceModal";
import ResourcePanel from "@/components/Workbench/ResourcePanel";
import SettingsPanel from "@/components/Workbench/SettingsPanel";
import Toolbar from "@/components/Workbench/Toolbar";

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <ResourcePanel />
        <PreviewCanvas />
        <SettingsPanel />
      </div>
      <ResourceModal />
      <AiIllustrationDialog />
    </div>
  );
}
