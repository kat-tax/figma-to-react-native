import { History } from 'history';
export interface RouterProps {
    history: History;
    basename?: string;
    children?: React.ReactNode;
}
export declare function Router({ basename, children, history }: RouterProps): React.ReactNode;
export declare namespace Router {
    var displayName: string;
}
