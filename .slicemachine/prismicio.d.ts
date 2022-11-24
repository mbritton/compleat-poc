// Code generated by Slice Machine. DO NOT EDIT.

import type * as prismicT from "@prismicio/types";
import type * as prismic from "@prismicio/client";

type Simplify<T> = {
    [KeyType in keyof T]: T[KeyType];
};
/** Content for About Page Images documents */
interface AboutPageImagesDocumentData {
    /**
     * Slice Zone field in *About Page Images*
     *
     * - **Field Type**: Slice Zone
     * - **Placeholder**: *None*
     * - **API ID Path**: about_page_images.slices[]
     * - **Tab**: Main
     * - **Documentation**: https://prismic.io/docs/core-concepts/slices
     *
     */
    slices: prismicT.SliceZone<AboutPageImagesDocumentDataSlicesSlice>;
}
/**
 * Slice for *About Page Images → Slice Zone*
 *
 */
type AboutPageImagesDocumentDataSlicesSlice = AboutImagesSlice;
/**
 * About Page Images document from Prismic
 *
 * - **API ID**: `about_page_images`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AboutPageImagesDocument<Lang extends string = string> = prismicT.PrismicDocumentWithoutUID<Simplify<AboutPageImagesDocumentData>, "about_page_images", Lang>;
/** Content for About Page Text documents */
interface AboutPageTextDocumentData {
    /**
     * Slice Zone field in *About Page Text*
     *
     * - **Field Type**: Slice Zone
     * - **Placeholder**: *None*
     * - **API ID Path**: about_page_text.slices[]
     * - **Tab**: Main
     * - **Documentation**: https://prismic.io/docs/core-concepts/slices
     *
     */
    slices: prismicT.SliceZone<AboutPageTextDocumentDataSlicesSlice>;
}
/**
 * Slice for *About Page Text → Slice Zone*
 *
 */
type AboutPageTextDocumentDataSlicesSlice = AboutTextSlice | AboutImagesSlice;
/**
 * About Page Text document from Prismic
 *
 * - **API ID**: `about_page_text`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AboutPageTextDocument<Lang extends string = string> = prismicT.PrismicDocumentWithoutUID<Simplify<AboutPageTextDocumentData>, "about_page_text", Lang>;
export type AllDocumentTypes = AboutPageImagesDocument | AboutPageTextDocument;
/**
 * Primary content in AboutImages → Primary
 *
 */
interface AboutImagesSliceDefaultPrimary {
    /**
     * aboutHero_belowSquareL field in *AboutImages → Primary*
     *
     * - **Field Type**: Image
     * - **Placeholder**: *None*
     * - **API ID Path**: about_images.primary.abouthero_belowsquarel
     * - **Documentation**: https://prismic.io/docs/core-concepts/image
     *
     */
    abouthero_belowsquarel: prismicT.ImageField<never>;
    /**
     * aboutHero_belowSquareR field in *AboutImages → Primary*
     *
     * - **Field Type**: Image
     * - **Placeholder**: *None*
     * - **API ID Path**: about_images.primary.aboutHero_belowSquareR
     * - **Documentation**: https://prismic.io/docs/core-concepts/image
     *
     */
    aboutHero_belowSquareR: prismicT.ImageField<never>;
    /**
     * aboutHero_content field in *AboutImages → Primary*
     *
     * - **Field Type**: Image
     * - **Placeholder**: *None*
     * - **API ID Path**: about_images.primary.abouthero_content
     * - **Documentation**: https://prismic.io/docs/core-concepts/image
     *
     */
    abouthero_content: prismicT.ImageField<never>;
    /**
     * aboutHero_right field in *AboutImages → Primary*
     *
     * - **Field Type**: Image
     * - **Placeholder**: *None*
     * - **API ID Path**: about_images.primary.aboutHero_right
     * - **Documentation**: https://prismic.io/docs/core-concepts/image
     *
     */
    aboutHero_right: prismicT.ImageField<never>;
    /**
     * rightVertical field in *AboutImages → Primary*
     *
     * - **Field Type**: Image
     * - **Placeholder**: *None*
     * - **API ID Path**: about_images.primary.rightvertical
     * - **Documentation**: https://prismic.io/docs/core-concepts/image
     *
     */
    rightvertical: prismicT.ImageField<never>;
}
/**
 * Default variation for AboutImages Slice
 *
 * - **API ID**: `default`
 * - **Description**: `AboutImages`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 *
 */
export type AboutImagesSliceDefault = prismicT.SharedSliceVariation<"default", Simplify<AboutImagesSliceDefaultPrimary>, never>;
/**
 * Slice variation for *AboutImages*
 *
 */
type AboutImagesSliceVariation = AboutImagesSliceDefault;
/**
 * AboutImages Shared Slice
 *
 * - **API ID**: `about_images`
 * - **Description**: `AboutImages`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 *
 */
export type AboutImagesSlice = prismicT.SharedSlice<"about_images", AboutImagesSliceVariation>;
/**
 * Primary content in AboutText → Primary
 *
 */
interface AboutTextSliceDefaultPrimary {
    /**
     * Title field in *AboutText → Primary*
     *
     * - **Field Type**: Title
     * - **Placeholder**: This is where it all begins...
     * - **API ID Path**: about_text.primary.title
     * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
     *
     */
    title: prismicT.TitleField;
    /**
     * Description field in *AboutText → Primary*
     *
     * - **Field Type**: Rich Text
     * - **Placeholder**: A nice description of your feature
     * - **API ID Path**: about_text.primary.description
     * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
     *
     */
    description: prismicT.RichTextField;
}
/**
 * Default variation for AboutText Slice
 *
 * - **API ID**: `default`
 * - **Description**: `AboutText`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 *
 */
export type AboutTextSliceDefault = prismicT.SharedSliceVariation<"default", Simplify<AboutTextSliceDefaultPrimary>, never>;
/**
 * Slice variation for *AboutText*
 *
 */
type AboutTextSliceVariation = AboutTextSliceDefault;
/**
 * AboutText Shared Slice
 *
 * - **API ID**: `about_text`
 * - **Description**: `AboutText`
 * - **Documentation**: https://prismic.io/docs/core-concepts/reusing-slices
 *
 */
export type AboutTextSlice = prismicT.SharedSlice<"about_text", AboutTextSliceVariation>;
declare module "@prismicio/client" {
    interface CreateClient {
        (repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
    }
    namespace Content {
        export type { AboutPageImagesDocumentData, AboutPageImagesDocumentDataSlicesSlice, AboutPageImagesDocument, AboutPageTextDocumentData, AboutPageTextDocumentDataSlicesSlice, AboutPageTextDocument, AllDocumentTypes, AboutImagesSliceDefaultPrimary, AboutImagesSliceDefault, AboutImagesSliceVariation, AboutImagesSlice, AboutTextSliceDefaultPrimary, AboutTextSliceDefault, AboutTextSliceVariation, AboutTextSlice };
    }
}
