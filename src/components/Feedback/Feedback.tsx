import React, { useContext, useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../../../mk/hooks/useAuth";
import useApi from "../../../mk/hooks/useApi";
import Layout from "../../../mk/components/layout/Layout";
import TabsButtons from "../../../mk/components/ui/TabsButton/TabsButton";
import Card from "../../../mk/components/ui/Card/Card";
import Button from "../../../mk/components/forms/Button/Button";
import { TextArea } from "../../../mk/components/forms/TextArea/TextArea";
import Check from "../../../mk/components/forms/Check/Check";
import Icon from "../../../mk/components/ui/Icon/Icon";
import { cssVar, FONTS } from "../../../mk/styles/themes";


const Feedback = () => {
  const [typeSearch, setTypeSearch] = useState("CC");
  const { showToast }: any = useAuth();
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors]: any = useState({});
  const { execute } = useApi();

  const [imageData, setImageData] = useState("");


  const handleInputChange = (name: string, value: string) => {

    setFormState({
      ...formState,
      [name]: value,
    });
  };
 
  

  useFocusEffect(
    React.useCallback(() => {
      setFormState({});
      setImageData("");
    }, [])
  );

  const sendMessage = () => {

    const url = `whatsapp://send?phone=%2B59177333207`;



    return Linking.openURL(url);
  }
  const sendEmail = () => {

    return Linking.openURL('mailto:hola@condaty.com?');
  }


  const onSave = async () => {
    let err = {};

    if (!formState.obs) err = { ...err, obs: "El comentario es requerido" };
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    
    const { data, error } = await execute("/feedbacks", "POST", formState);

    if (data?.success == true) {
      showToast(
        "Gracias por tu  comentario esto nos ayudará a mejorar.",
        "success"
      );
      setFormState({});
      setErrors({});
      setImageData("");
    } else {
      showToast(error?.data?.message || error?.message, "error");
      console.log("error:", error);
      setErrors(error?.data?.errors);
    }
  };
  
  return (
    <Layout title="Soporte y atención al cliente" style={{}}>
    <ScrollView>
      
      
        <TabsButtons
          tabs={[
            { value: "CC", text: "Canales de contacto" },
            { value: "BS", text: "Buzón de sugerencias" },
          ]}
          sel={typeSearch}
          setSel={setTypeSearch}
          style={{ alignSelf: "center" }}
        //   styleContainer={{margin:0}}
        //   styleText={{fontSize:12,padding:2}}
        />
        {typeSearch === "CC" && <View>
          <Card >
            <Text style={{ ...styles.label }}>Te presentamos 2 facilidades para que puedas contactarte con nosotros y podamos ayudarte con lo que necesites.</Text>
            <Text style={{ ...styles.label }}> Te responderemos lo más pronto posible.</Text>
            <Button onPress={() => sendMessage()} styleText={{ textAlign: "right", color: pallete.dark?.light?.color, fontSize: 12 }} style={{ justifyContent: "flex-start", backgroundColor: pallete.dark?.dark.v1 }} icon={IconWhatssapp}>Contáctanos mediante whatsApp</Button>
            <Button onPress={() => sendEmail()} styleText={{ textAlign: "right", color: pallete.dark?.light?.color, fontSize: 12 }} style={{ justifyContent: "flex-start", backgroundColor: pallete.dark?.dark.v1 }} icon={IconEmailOutlined} iconFillStroke="#FAFAFA" iconColor={"transparent"}>Contáctanos mediante E-mail</Button>

          </Card>
          <Card>
            <Text style={{ ...styles.label }}>Bienvenido (a) a tu sesión de soporte y atención al cliente, esta sesión te ayudará a resolver
              problemas, dudas y cualquier tipo de inconveniente.</Text>
            <Text style={{ ...styles.label }}>Horarios y días de atención: Lunes a viernes de 08:00 a 19:00 </Text>
            <Image source={require("../images/soporte.png")} style={{ alignSelf: "center",width:156,height:170,  }}
            /></Card></View>}
        {typeSearch === "BS" &&
          <>
          <View style={{marginTop:4}}></View>
          <Text style={{...styles.label}}>Déjanos tus comentarios o sube una captura de pantalla</Text>
          <Text style={{...styles.label}}>En el recuadro de abajo reporta un problema o déjanos saber lo que no entendiste en nuestra app para seguir mejorando</Text>
            <TextArea
              name="obs"
              error={errors}
              value={formState["obs"]}
              onChange={(value) => handleInputChange("obs", value)}
              style={{
                fontSize: 14,
                marginTop: 16,
              }}
              lines={4}
              placeholder="Ej: La opción de registrar un ingreso no está
              funcionando, podrían ayudarme por favor"
              //fixedHeight={true}
              
            ></TextArea>

            <View style={{marginBottom:imageData ? 130:0}}>
              <TouchableOpacity
                onPress={() => {
                  openGallery(formState, setFormState, setImageData, showToast);
                }}
                style={{
                  //
                  marginTop: 12,
                  paddingVertical: 8,
                  height: 100,
                  borderRadius: 16,

                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: imageData
                    ? "transparent"
                    : cssVar.cBlack,
                }}
              >
                {imageData ? (
                  <View
                    style={{
                      marginVertical: 16,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 16,
                    }}
                  >
                    <Image
                      source={{ uri: imageData }}
                      resizeMode="cover"
                      style={{
                        width: 256,
                        height: 256,
                        borderRadius: 8,
                        marginTop: 100,
                      }}
                    // onError={(e: any) => {
                    //   setErrorImage(e);
                    // }}
                    />
                  </View>
                ) : (
                  <>
                    <Icon
                      name={IconScreenShot}
                      color={pallete[theme.currentTheme]?.light.v3}
                    />
                    <Text
                      style={{
                        color: pallete[theme.currentTheme]?.light.v3,
                        fontFamily: "Poppins Medium",
                        fontSize: 12,
                      }}
                    >
                      Subir una foto (opcional)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <Text style={{...styles.label,marginTop:4}}>¿Te gustaría que nos pongamos en contacto contigo?</Text>
            <View style={{flexDirection:"row", alignItems:"center"}}>

            <Check
          label="Si"
          name={"contact_me"}
          value={formState.contact_me === "Y" ? "Y" : "X"}
          style={{marginRight:10,}}
          optionValue={["Y", "X"]}
          onChange={(value) => handleInputChange("contact_me", value)}
          textStyle={{color:cssVar.cWhiteV4}}
        />
         <Check
          label="No"
          name={"contact_me"}
          value={formState.contact_me === "X" ? "X" : "Y"}
          optionValue={[ "X","Y"]}
          onChange={(value) => handleInputChange("contact_me", value)}
          textStyle={{color:cssVar.cWhiteV4}}
        />
            </View>
      
            <Button
            //   stylePress={{
                
            //     marginTop: 16
           
            //   }}
              onPress={() => onSave()}
              variant={formState.obs || formState.avatar ? "primary" : "secondary"}
            >
              Enviar reporte
            </Button>
          </>
        }

</ScrollView>
    </Layout>
  );
};

export default Feedback;


const styles = StyleSheet.create({
    label:{
        color: cssVar.cWhiteV2,
        fontSize: 12,
        fontFamily: FONTS.light,
    },
    textButton:{      
        color: cssVar.cWhiteV2,
        fontSize: 12,
        fontFamily: FONTS.light
    },
    button:{
     justifyContent: "flex-start",
     backgroundColor: cssVar.cBlack
    }

})