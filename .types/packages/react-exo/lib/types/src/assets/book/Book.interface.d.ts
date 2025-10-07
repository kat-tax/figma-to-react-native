import { ReadiumProps } from 'react-native-readium';
export type BookComponent = React.ForwardRefExoticComponent<BookProps>;
export type BookProps = Omit<ReadiumProps, 'file'> & {
    /** The location of the book */
    url: string;
    /** The theme of the book */
    theme?: 'default' | 'night' | 'sepia';
};
export interface BookRef {
    /** Go to the previous page */
    prevPage: () => void;
    /** Go to the next page */
    nextPage: () => void;
}
