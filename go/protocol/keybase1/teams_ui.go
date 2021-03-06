// Auto-generated by avdl-compiler v1.3.13 (https://github.com/keybase/node-avdl-compiler)
//   Input file: avdl/keybase1/teams_ui.avdl

package keybase1

import (
	"github.com/keybase/go-framed-msgpack-rpc/rpc"
	context "golang.org/x/net/context"
)

type TeamCreateArg struct {
	SessionID int    `codec:"sessionID" json:"sessionID"`
	Name      string `codec:"name" json:"name"`
}

type TeamsInterface interface {
	TeamCreate(context.Context, TeamCreateArg) error
}

func TeamsProtocol(i TeamsInterface) rpc.Protocol {
	return rpc.Protocol{
		Name: "keybase.1.teams",
		Methods: map[string]rpc.ServeHandlerDescription{
			"teamCreate": {
				MakeArg: func() interface{} {
					ret := make([]TeamCreateArg, 1)
					return &ret
				},
				Handler: func(ctx context.Context, args interface{}) (ret interface{}, err error) {
					typedArgs, ok := args.(*[]TeamCreateArg)
					if !ok {
						err = rpc.NewTypeError((*[]TeamCreateArg)(nil), args)
						return
					}
					err = i.TeamCreate(ctx, (*typedArgs)[0])
					return
				},
				MethodType: rpc.MethodCall,
			},
		},
	}
}

type TeamsClient struct {
	Cli rpc.GenericClient
}

func (c TeamsClient) TeamCreate(ctx context.Context, __arg TeamCreateArg) (err error) {
	err = c.Cli.Call(ctx, "keybase.1.teams.teamCreate", []interface{}{__arg}, nil)
	return
}
