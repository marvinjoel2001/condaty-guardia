import React, {useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import List from '../../../mk/components/ui/List/List';
import useApi from '../../../mk/hooks/useApi';
import {View, StyleSheet} from 'react-native';
import ItemList from '../../../mk/components/ui/ItemList/ItemList';
import Icon from '../../../mk/components/ui/Icon/Icon';

import {IconDoc2, IconEXE, IconJPG, IconPDF} from '../../icons/IconLibrary';

import {cssVar} from '../../../mk/styles/themes';
import DocumentDetail from './DocumentDetail';
import ListFlat from '../../../mk/components/ui/List/ListFlat';

const FILE_TYPE_ICONS: Record<string, string> = {
  doc: IconDoc2,
  xlsx: IconEXE,
  jpg: IconJPG,
  pdf: IconPDF,
};

const Documents = () => {
  const [openDeatil, setOpenDetail] = useState({open: false, item: null});
  const {
    data: documents,
    loaded,
    reload,
  } = useApi(
    '/documents',
    'GET',
    {
      perPage: -1,
      fullType: 'L',
      page: 1,
    },
    3,
  );

  const getFileType = (ext: string) => {
    if (ext.includes('pdf')) return 'pdf';
    if (ext.includes('doc')) return 'doc';
    if (ext.includes('xlsx')) return 'doc';
    if (
      ext.includes('jpg') ||
      ext.includes('jpeg') ||
      ext.includes('webp') ||
      ext.includes('png')
    )
      return 'jpg';
    if (ext.includes('exe')) return 'exe';
    return ext;
  };

  const DocumentList = (document: any) => {
    const fileType = getFileType(document.ext.toLowerCase());
    const iconName = FILE_TYPE_ICONS[fileType] || IconPDF;

    return (
      <ItemList
        title={document?.name}
        onPress={() => setOpenDetail({open: true, item: document})}
        subtitle="Administración"
        left={
          <View style={styles.iconContainer}>
            <Icon
              size={26}
              name={iconName}
              color={fileType === 'doc' ? 'transparent' : cssVar.cBlack}
              fillStroke={fileType === 'doc' ? cssVar.cBlack : 'transparent'}
            />
          </View>
        }
      />
    );
  };

  return (
    <Layout title="Documentos" refresh={() => reload()} scroll={false}>
      <ListFlat
        style={{marginTop: 12}}
        data={documents?.data}
        renderItem={DocumentList}
        refreshing={!loaded}
        enablePagination={false}
      />

      {openDeatil?.open && (
        <DocumentDetail
          open={openDeatil?.open}
          onClose={() => setOpenDetail({open: false, item: null})}
          item={openDeatil?.item}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: cssVar.cWhiteV1,
    padding: 8,
    borderRadius: 100,
  },
});

export default Documents;
