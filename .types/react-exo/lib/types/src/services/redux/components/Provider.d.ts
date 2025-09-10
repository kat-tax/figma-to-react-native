import * as Redux from 'react-redux';
export interface ProviderProps extends Redux.ProviderProps {
    loading?: React.ReactNode;
}
export declare function Provider(props: ProviderProps): React.ReactNode;
