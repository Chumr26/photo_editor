import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface HistoryItem {
  id: number;
  action: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onDeleteHistory: (id: number) => void;
  toggleShowFullHistory: () => void;
  showFullHistory: boolean;
  fullHistoryCount: number;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onDeleteHistory, toggleShowFullHistory, showFullHistory, fullHistoryCount }) => {
  return (
    <div className="w-64 h-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden flex flex-col flex-shrink-0">
      <Tabs
        defaultValue="history"
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-1 rounded-none border-b">
          <TabsTrigger value="history" className="gap-2">
            Lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="history"
          className="flex-1 overflow-y-auto mt-0 p-4"
        >
          <ScrollArea className="h-full pr-4">
            {history.length > 0 ? (
              <ul>
                {history.map((item) => (
                  <li key={item.id} className="flex items-center justify-between mb-2">
                    <span>{item.action}</span>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteHistory(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Chưa có hành động nào.</p>
            )}
            {fullHistoryCount > 12 && (
                <div className="text-center pt-2"> {/* Removed mt-4, added pt-2 */}
                    <Button onClick={toggleShowFullHistory} variant="link" size="sm">
                        {showFullHistory ? 'Thu gọn' : 'Xem thêm'}
                    </Button>
                </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryPanel;
