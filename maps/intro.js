const map = `
############################################################
#    #              #                     #                #
# G  #k             #                     #                #
#    #              #                     #                #
#    ########## #####                              Y       #
#    #              #                     #                #
#    #              #                     #                #
##d###              ########### ############################
#    #              Ͳ                          #           #
#    #              #                          #           #
#    #              #                         K#           #
#    #              #############D##############           #
#                   #                          #           #
#    #              #                          #           #
#    #              #                          #           #
#    #              #                                      #
#    #              #                          #           #
#    #              #                          #           #
#    #              #                          #           #
#    #              ############################# ##########
#    #              #                                      #
#    #              #                                      #
#    #                                                     #
############################################################
`;

export const data = () => map.substring(1, map.length-1);